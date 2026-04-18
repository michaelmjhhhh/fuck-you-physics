package importer

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

var sourceFilenamePattern = regexp.MustCompile(`^(May|Nov) (\d{4}) (HL|SL)(?: (TZ\d))? (?:Q)?(\d+) ([A-D])\.png$|^(Specimen Paper) (\d{4}) (HL|SL) (?:Q)?(\d+) ([A-D])\.png$`)

type SourceMetadata struct {
	Year           int
	ExamMonth      string
	SessionLabel   string
	Level          string
	Timezone       string
	QuestionNumber int
	CorrectAnswer  string
}

type QuestionFile struct {
	ID              string           `json:"id"`
	Topic           string           `json:"topic"`
	TopicCode       string           `json:"topic_code"`
	SubTopic        string           `json:"sub_topic"`
	Paper           PaperFile        `json:"paper"`
	QuestionNumber  int              `json:"question_number"`
	ContentMarkdown string           `json:"content_markdown"`
	HasDiagram      bool             `json:"has_diagram"`
	DiagramMetadata DiagramMetadata  `json:"diagram_metadata"`
	Options         []QuestionOption `json:"options"`
	CorrectAnswer   string           `json:"correct_answer"`
	VibeExplanation string           `json:"vibe_explanation"`
	SourceImagePath string           `json:"source_image_path,omitempty"`
}

type PaperFile struct {
	Year           int    `json:"year"`
	Month          string `json:"month"`
	SessionLabel   string `json:"session_label"`
	Level          string `json:"level"`
	Timezone       string `json:"timezone"`
	PaperCode      string `json:"paper_code"`
	SourceFilename string `json:"source_filename"`
}

type DiagramMetadata struct {
	Description      string   `json:"description"`
	LabelsToPreserve []string `json:"labels_to_preserve"`
}

type QuestionOption struct {
	Label string `json:"label"`
	Text  string `json:"text"`
}

type ExtractionJob struct {
	ID              string    `json:"id"`
	Topic           string    `json:"topic"`
	TopicCode       string    `json:"topic_code"`
	SubTopic        string    `json:"sub_topic"`
	Paper           PaperFile `json:"paper"`
	QuestionNumber  int       `json:"question_number"`
	CorrectAnswer   string    `json:"correct_answer"`
	HasDiagram      bool      `json:"has_diagram"`
	DiagramMetadata any       `json:"diagram_metadata"`
	SourceImagePath string    `json:"source_image_path"`
	Options         []any     `json:"options"`
	ContentMarkdown string    `json:"content_markdown"`
	VibeExplanation string    `json:"vibe_explanation"`
}

type ManifestIndex struct {
	GeneratedCount int                  `json:"generated_count"`
	Items          []ManifestIndexEntry `json:"items"`
}

type ManifestIndexEntry struct {
	ID              string `json:"id"`
	Topic           string `json:"topic"`
	TopicCode       string `json:"topic_code"`
	QuestionNumber  int    `json:"question_number"`
	ManifestPath    string `json:"manifest_path"`
	SourceImagePath string `json:"source_image_path"`
	CorrectAnswer   string `json:"correct_answer"`
}

type LLMExtractionConfig struct {
	ManifestIndexPath string
	ManifestRoot      string
	SourceRoot        string
	OutputDir         string
	APIBaseURL        string
	APIKey            string
	Model             string
	Limit             int
	ImportToSQLite    bool
	DBPath            string
	SchemaPath        string
}

type LLMExtractionResult struct {
	Processed int
	Succeeded int
	Rejected  int
	Imported  int
	Errors    []string
}

type llmExtractionPayload struct {
	SubTopic        string          `json:"sub_topic"`
	ContentMarkdown string          `json:"content_markdown"`
	HasDiagram      json.RawMessage `json:"has_diagram"`
	DiagramMetadata DiagramMetadata `json:"diagram_metadata"`
	Options         json.RawMessage `json:"options"`
	VibeExplanation string          `json:"vibe_explanation"`
}

type llmChatRequest struct {
	Model          string           `json:"model"`
	Messages       []llmChatMessage `json:"messages"`
	Temperature    float64          `json:"temperature"`
	ResponseFormat map[string]any   `json:"response_format,omitempty"`
}

type llmChatMessage struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

type llmChatContentPart struct {
	Type     string          `json:"type"`
	Text     string          `json:"text,omitempty"`
	ImageURL *llmImageURLObj `json:"image_url,omitempty"`
}

type llmImageURLObj struct {
	URL string `json:"url"`
}

type llmChatResponse struct {
	Choices []struct {
		Message struct {
			Content any `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func ParseSourceFilename(name string) (SourceMetadata, error) {
	matches := sourceFilenamePattern.FindStringSubmatch(name)
	if matches == nil {
		return SourceMetadata{}, fmt.Errorf("unsupported source filename format: %s", name)
	}

	if matches[1] != "" {
		year, _ := strconv.Atoi(matches[2])
		questionNumber, _ := strconv.Atoi(matches[5])
		return SourceMetadata{
			Year:           year,
			ExamMonth:      matches[1],
			SessionLabel:   fmt.Sprintf("%s %d", matches[1], year),
			Level:          matches[3],
			Timezone:       matches[4],
			QuestionNumber: questionNumber,
			CorrectAnswer:  matches[6],
		}, nil
	}

	year, _ := strconv.Atoi(matches[8])
	questionNumber, _ := strconv.Atoi(matches[10])
	return SourceMetadata{
		Year:           year,
		ExamMonth:      "Specimen",
		SessionLabel:   fmt.Sprintf("Specimen Paper %d", year),
		Level:          matches[9],
		Timezone:       "",
		QuestionNumber: questionNumber,
		CorrectAnswer:  matches[11],
	}, nil
}

func ImportJSONFile(dbPath, schemaPath, jsonPath string) error {
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		return fmt.Errorf("read schema: %w", err)
	}
	return importJSONFileWithSchema(dbPath, string(schemaSQL), jsonPath)
}

func ImportJSONFilesInDirectory(dbPath, schemaPath, dirPath string) (int, error) {
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		return 0, fmt.Errorf("read schema: %w", err)
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return 0, fmt.Errorf("read directory: %w", err)
	}

	jsonPaths := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}
		jsonPaths = append(jsonPaths, filepath.Join(dirPath, entry.Name()))
	}
	if len(jsonPaths) == 0 {
		return 0, fmt.Errorf("no json files found in %s", dirPath)
	}
	sort.Strings(jsonPaths)

	for _, jsonPath := range jsonPaths {
		if err := importJSONFileWithSchema(dbPath, string(schemaSQL), jsonPath); err != nil {
			return 0, err
		}
	}

	return len(jsonPaths), nil
}

func GenerateExtractionManifests(sourceRoot, outputRoot string) (int, error) {
	topicEntries, err := os.ReadDir(sourceRoot)
	if err != nil {
		return 0, fmt.Errorf("read source root: %w", err)
	}

	count := 0
	index := ManifestIndex{Items: []ManifestIndexEntry{}}
	for _, topicEntry := range topicEntries {
		if !topicEntry.IsDir() {
			continue
		}

		topicCode, topicName, topicSlug, err := parseTopicFolderName(topicEntry.Name())
		if err != nil {
			continue
		}

		topicPath := filepath.Join(sourceRoot, topicEntry.Name())
		imageEntries, err := os.ReadDir(topicPath)
		if err != nil {
			return 0, fmt.Errorf("read topic folder %s: %w", topicPath, err)
		}

		manifestDir := filepath.Join(outputRoot, topicSlug)
		if err := os.MkdirAll(manifestDir, 0o755); err != nil {
			return 0, fmt.Errorf("create manifest dir: %w", err)
		}

		for _, imageEntry := range imageEntries {
			if imageEntry.IsDir() || filepath.Ext(imageEntry.Name()) != ".png" {
				continue
			}

			meta, err := ParseSourceFilename(imageEntry.Name())
			if err != nil {
				continue
			}

			relImagePath := filepath.ToSlash(filepath.Join(topicEntry.Name(), imageEntry.Name()))

			job := ExtractionJob{
				ID:        buildQuestionID(meta),
				Topic:     topicName,
				TopicCode: topicCode,
				SubTopic:  "",
				Paper: PaperFile{
					Year:           meta.Year,
					Month:          meta.ExamMonth,
					SessionLabel:   meta.SessionLabel,
					Level:          meta.Level,
					Timezone:       meta.Timezone,
					PaperCode:      "Paper 1",
					SourceFilename: imageEntry.Name(),
				},
				QuestionNumber:  meta.QuestionNumber,
				CorrectAnswer:   meta.CorrectAnswer,
				HasDiagram:      false,
				DiagramMetadata: map[string]any{"description": "", "labels_to_preserve": []string{}},
				SourceImagePath: relImagePath,
				Options:         []any{},
				ContentMarkdown: "",
				VibeExplanation: "",
			}

			raw, err := json.MarshalIndent(job, "", "  ")
			if err != nil {
				return 0, fmt.Errorf("marshal manifest: %w", err)
			}

			manifestPath := filepath.Join(manifestDir, job.ID+".json")
			if err := os.WriteFile(manifestPath, raw, 0o644); err != nil {
				return 0, fmt.Errorf("write manifest: %w", err)
			}
			relManifestPath, err := filepath.Rel(outputRoot, manifestPath)
			if err != nil {
				return 0, fmt.Errorf("derive manifest path: %w", err)
			}
			index.Items = append(index.Items, ManifestIndexEntry{
				ID:              job.ID,
				Topic:           job.Topic,
				TopicCode:       job.TopicCode,
				QuestionNumber:  job.QuestionNumber,
				ManifestPath:    filepath.ToSlash(relManifestPath),
				SourceImagePath: job.SourceImagePath,
				CorrectAnswer:   job.CorrectAnswer,
			})
			count++
		}
	}

	if count == 0 {
		return 0, fmt.Errorf("no supported png files found in %s", sourceRoot)
	}

	sort.Slice(index.Items, func(i, j int) bool {
		if index.Items[i].TopicCode == index.Items[j].TopicCode {
			return index.Items[i].ID < index.Items[j].ID
		}
		return index.Items[i].TopicCode < index.Items[j].TopicCode
	})
	index.GeneratedCount = len(index.Items)
	indexRaw, err := json.MarshalIndent(index, "", "  ")
	if err != nil {
		return 0, fmt.Errorf("marshal manifest index: %w", err)
	}
	if err := os.WriteFile(filepath.Join(outputRoot, "manifest-index.json"), indexRaw, 0o644); err != nil {
		return 0, fmt.Errorf("write manifest index: %w", err)
	}

	return count, nil
}

func RunLLMExtraction(cfg LLMExtractionConfig) (LLMExtractionResult, error) {
	if strings.TrimSpace(cfg.ManifestIndexPath) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires ManifestIndexPath")
	}
	if strings.TrimSpace(cfg.ManifestRoot) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires ManifestRoot")
	}
	if strings.TrimSpace(cfg.SourceRoot) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires SourceRoot")
	}
	if strings.TrimSpace(cfg.OutputDir) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires OutputDir")
	}
	if strings.TrimSpace(cfg.APIBaseURL) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires APIBaseURL")
	}
	if strings.TrimSpace(cfg.APIKey) == "" {
		cfg.APIKey = strings.TrimSpace(os.Getenv("SILICONROUTER_API_KEY"))
	}
	if strings.TrimSpace(cfg.APIKey) == "" {
		cfg.APIKey = strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
	}
	if strings.TrimSpace(cfg.APIKey) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires APIKey")
	}
	if strings.TrimSpace(cfg.Model) == "" {
		return LLMExtractionResult{}, fmt.Errorf("llm extraction requires Model")
	}
	if cfg.ImportToSQLite {
		if strings.TrimSpace(cfg.DBPath) == "" || strings.TrimSpace(cfg.SchemaPath) == "" {
			return LLMExtractionResult{}, fmt.Errorf("llm extraction import requires DBPath and SchemaPath")
		}
	}

	raw, err := os.ReadFile(cfg.ManifestIndexPath)
	if err != nil {
		return LLMExtractionResult{}, fmt.Errorf("read manifest index: %w", err)
	}
	var index ManifestIndex
	if err := json.Unmarshal(raw, &index); err != nil {
		return LLMExtractionResult{}, fmt.Errorf("parse manifest index: %w", err)
	}
	items := index.Items
	if cfg.Limit > 0 && cfg.Limit < len(items) {
		items = items[:cfg.Limit]
	}
	if len(items) == 0 {
		return LLMExtractionResult{}, fmt.Errorf("no manifest items to process")
	}

	if err := os.MkdirAll(cfg.OutputDir, 0o755); err != nil {
		return LLMExtractionResult{}, fmt.Errorf("create output dir: %w", err)
	}

	schemaSQL := ""
	if cfg.ImportToSQLite {
		schemaRaw, err := os.ReadFile(cfg.SchemaPath)
		if err != nil {
			return LLMExtractionResult{}, fmt.Errorf("read schema: %w", err)
		}
		schemaSQL = string(schemaRaw)
	}

	result := LLMExtractionResult{Errors: []string{}}

	for _, item := range items {
		result.Processed++

		manifestPath := filepath.Join(cfg.ManifestRoot, filepath.FromSlash(item.ManifestPath))
		manifestRaw, err := os.ReadFile(manifestPath)
		if err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: read manifest failed: %v", item.ID, err))
			continue
		}

		var job ExtractionJob
		if err := json.Unmarshal(manifestRaw, &job); err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: parse manifest failed: %v", item.ID, err))
			continue
		}

		q, err := extractQuestionWithLLM(cfg, job)
		if err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: llm extraction failed: %v", item.ID, err))
			continue
		}

		if strings.TrimSpace(q.ContentMarkdown) == "" {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: content_markdown is empty", item.ID))
			continue
		}
		if strings.TrimSpace(q.VibeExplanation) == "" {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: vibe_explanation is empty", item.ID))
			continue
		}

		meta, err := ParseSourceFilename(q.Paper.SourceFilename)
		if err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: invalid source filename metadata: %v", item.ID, err))
			continue
		}
		if err := validateQuestionFile(q, meta, manifestPath); err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: validation failed: %v", item.ID, err))
			continue
		}

		outPath := filepath.Join(cfg.OutputDir, q.ID+".json")
		encoded, err := json.MarshalIndent(q, "", "  ")
		if err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: marshal output failed: %v", item.ID, err))
			continue
		}
		if err := os.WriteFile(outPath, encoded, 0o644); err != nil {
			result.Rejected++
			result.Errors = append(result.Errors, fmt.Sprintf("%s: write output failed: %v", item.ID, err))
			continue
		}
		result.Succeeded++

		if cfg.ImportToSQLite {
			if err := importJSONFileWithSchema(cfg.DBPath, schemaSQL, outPath); err != nil {
				result.Rejected++
				result.Errors = append(result.Errors, fmt.Sprintf("%s: sqlite import failed: %v", item.ID, err))
				continue
			}
			result.Imported++
		}
	}

	reportRaw, err := json.MarshalIndent(result, "", "  ")
	if err == nil {
		_ = os.WriteFile(filepath.Join(cfg.OutputDir, "llm-extraction-report.json"), reportRaw, 0o644)
	}

	return result, nil
}

func importJSONFileWithSchema(dbPath, schemaSQL, jsonPath string) error {
	raw, err := os.ReadFile(jsonPath)
	if err != nil {
		return fmt.Errorf("read json: %w", err)
	}

	var q QuestionFile
	if err := json.Unmarshal(raw, &q); err != nil {
		return fmt.Errorf("parse json: %w", err)
	}

	meta, err := ParseSourceFilename(q.Paper.SourceFilename)
	if err != nil {
		return err
	}
	if err := validateQuestionFile(q, meta, jsonPath); err != nil {
		return err
	}

	labelsJSON, err := json.Marshal(q.DiagramMetadata.LabelsToPreserve)
	if err != nil {
		return fmt.Errorf("marshal labels: %w", err)
	}

	topicID := topicIDFromCodeAndName(q.TopicCode, q.Topic)
	paperID := paperIDFromQuestion(q)
	originalPath, err := filepath.Abs(jsonPath)
	if err != nil {
		return fmt.Errorf("resolve json path: %w", err)
	}

	var builder strings.Builder
	builder.WriteString(schemaSQL)
	builder.WriteString("\nBEGIN TRANSACTION;\n")
	builder.WriteString(fmt.Sprintf(
		"INSERT OR IGNORE INTO papers (id, year, exam_month, session_label, level, timezone, paper_code, source_type, source_filename) VALUES ('%s', %d, '%s', '%s', '%s', '%s', '%s', 'structured_import', '%s');\n",
		sqlEscape(paperID), meta.Year, sqlEscape(meta.ExamMonth), sqlEscape(meta.SessionLabel), sqlEscape(meta.Level), sqlEscape(meta.Timezone), sqlEscape(q.Paper.PaperCode), sqlEscape(q.Paper.SourceFilename),
	))
	builder.WriteString(fmt.Sprintf(
		"INSERT OR REPLACE INTO questions (id, topic_id, paper_id, sub_topic, question_number, content_markdown, has_diagram, diagram_description, labels_to_preserve_json, correct_answer, vibe_explanation, original_image_path, extraction_status) VALUES ('%s', '%s', '%s', '%s', %d, '%s', %d, '%s', '%s', '%s', '%s', '%s', 'draft');\n",
		sqlEscape(q.ID), sqlEscape(topicID), sqlEscape(paperID), sqlEscape(q.SubTopic), q.QuestionNumber, sqlEscape(q.ContentMarkdown), boolToInt(q.HasDiagram), sqlEscape(q.DiagramMetadata.Description), sqlEscape(string(labelsJSON)), sqlEscape(q.CorrectAnswer), sqlEscape(q.VibeExplanation), sqlEscape(originalPath),
	))
	builder.WriteString(fmt.Sprintf("DELETE FROM question_options WHERE question_id = '%s';\n", sqlEscape(q.ID)))
	for i, option := range q.Options {
		builder.WriteString(fmt.Sprintf(
			"INSERT INTO question_options (question_id, option_label, option_text, display_order) VALUES ('%s', '%s', '%s', %d);\n",
			sqlEscape(q.ID), sqlEscape(option.Label), sqlEscape(option.Text), i+1,
		))
	}
	builder.WriteString("COMMIT;\n")

	cmd := exec.Command("sqlite3", dbPath)
	cmd.Stdin = strings.NewReader(builder.String())
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("sqlite3 import failed: %w\n%s", err, string(out))
	}

	return nil
}

func extractQuestionWithLLM(cfg LLMExtractionConfig, job ExtractionJob) (QuestionFile, error) {
	imagePath := filepath.Join(cfg.SourceRoot, filepath.FromSlash(job.SourceImagePath))
	imageData, err := os.ReadFile(imagePath)
	if err != nil {
		return QuestionFile{}, fmt.Errorf("read source image: %w", err)
	}

	mimeType := mime.TypeByExtension(strings.ToLower(filepath.Ext(imagePath)))
	if mimeType == "" {
		mimeType = "image/png"
	}
	imageURL := "data:" + mimeType + ";base64," + base64.StdEncoding.EncodeToString(imageData)

	endpoint, err := buildChatCompletionsEndpoint(cfg.APIBaseURL)
	if err != nil {
		return QuestionFile{}, err
	}

	prompt := buildExtractionPrompt(job)
	reqBody := llmChatRequest{
		Model: cfg.Model,
		Messages: []llmChatMessage{
			{Role: "system", Content: "You extract IB Physics MCQ question data from a single image. Return only valid JSON matching the requested schema."},
			{Role: "user", Content: []llmChatContentPart{{Type: "text", Text: prompt}, {Type: "image_url", ImageURL: &llmImageURLObj{URL: imageURL}}}},
		},
		Temperature:    0,
		ResponseFormat: map[string]any{"type": "json_object"},
	}

	bodyRaw, err := json.Marshal(reqBody)
	if err != nil {
		return QuestionFile{}, fmt.Errorf("marshal llm request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(context.Background(), http.MethodPost, endpoint, bytes.NewReader(bodyRaw))
	if err != nil {
		return QuestionFile{}, fmt.Errorf("build llm request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+cfg.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	httpResp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return QuestionFile{}, fmt.Errorf("llm request failed: %w", err)
	}
	defer httpResp.Body.Close()

	respRaw, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return QuestionFile{}, fmt.Errorf("read llm response: %w", err)
	}
	if httpResp.StatusCode < 200 || httpResp.StatusCode > 299 {
		return QuestionFile{}, fmt.Errorf("llm api status %d: %s", httpResp.StatusCode, strings.TrimSpace(string(respRaw)))
	}

	var parsed llmChatResponse
	if err := json.Unmarshal(respRaw, &parsed); err != nil {
		return QuestionFile{}, fmt.Errorf("parse llm response envelope: %w", err)
	}
	if parsed.Error != nil && strings.TrimSpace(parsed.Error.Message) != "" {
		return QuestionFile{}, fmt.Errorf("llm api error: %s", parsed.Error.Message)
	}
	if len(parsed.Choices) == 0 {
		return QuestionFile{}, fmt.Errorf("llm response contained no choices")
	}

	content, err := extractLLMMessageContent(parsed.Choices[0].Message.Content)
	if err != nil {
		return QuestionFile{}, err
	}

	payloadRaw, err := normalizeJSONBlob(content)
	if err != nil {
		return QuestionFile{}, fmt.Errorf("extract json payload: %w", err)
	}

	var payload llmExtractionPayload
	if err := json.Unmarshal(payloadRaw, &payload); err != nil {
		return QuestionFile{}, fmt.Errorf("parse llm payload: %w", err)
	}

	normalizedOptions, err := normalizeLLMOptions(payload.Options)
	if err != nil {
		return QuestionFile{}, err
	}

	hasDiagram, err := normalizeHasDiagram(payload.HasDiagram)
	if err != nil {
		return QuestionFile{}, err
	}

	q := QuestionFile{
		ID:              job.ID,
		Topic:           job.Topic,
		TopicCode:       job.TopicCode,
		SubTopic:        strings.TrimSpace(payload.SubTopic),
		Paper:           job.Paper,
		QuestionNumber:  job.QuestionNumber,
		ContentMarkdown: strings.TrimSpace(payload.ContentMarkdown),
		HasDiagram:      hasDiagram,
		DiagramMetadata: DiagramMetadata{
			Description:      strings.TrimSpace(payload.DiagramMetadata.Description),
			LabelsToPreserve: payload.DiagramMetadata.LabelsToPreserve,
		},
		Options:         normalizedOptions,
		CorrectAnswer:   job.CorrectAnswer,
		VibeExplanation: strings.TrimSpace(payload.VibeExplanation),
		SourceImagePath: job.SourceImagePath,
	}

	if q.SubTopic == "" {
		q.SubTopic = job.SubTopic
	}
	if q.DiagramMetadata.LabelsToPreserve == nil {
		q.DiagramMetadata.LabelsToPreserve = []string{}
	}

	return q, nil
}

func buildChatCompletionsEndpoint(base string) (string, error) {
	trimmed := strings.TrimSpace(base)
	if trimmed == "" {
		return "", fmt.Errorf("api base url is empty")
	}
	u, err := url.Parse(trimmed)
	if err != nil {
		return "", fmt.Errorf("parse api base url: %w", err)
	}
	if u.Scheme == "" || u.Host == "" {
		return "", fmt.Errorf("invalid api base url: %s", base)
	}
	u.Path = strings.TrimSuffix(u.Path, "/") + "/chat/completions"
	return u.String(), nil
}

func buildExtractionPrompt(job ExtractionJob) string {
	return strings.TrimSpace(fmt.Sprintf(`Extract this single IB Physics MCQ question from the provided image.

Return strict JSON only with exactly these keys:
- sub_topic (string)
- content_markdown (string, LaTeX inline with $...$ and display with $$...$$ when needed)
- has_diagram (boolean)
- diagram_metadata (object with description:string and labels_to_preserve:string[])
- options (either array of 4 objects [{"label":"A","text":"..."}, ...] or object {"A":"...","B":"...","C":"...","D":"..."})
- vibe_explanation (string)

Rules:
1) Keep math scientifically faithful.
2) Options must include A,B,C,D exactly once each.
3) If an option is image-only with no readable text, set its text to its label letter ("A"/"B"/"C"/"D") instead of empty.
4) Do not include answer key in output.
5) No markdown code fences.

Context:
- topic=%s
- topic_code=%s
- source_filename=%s
- question_number=%d
`, job.Topic, job.TopicCode, job.Paper.SourceFilename, job.QuestionNumber))
}

func extractLLMMessageContent(content any) (string, error) {
	switch value := content.(type) {
	case string:
		if strings.TrimSpace(value) == "" {
			return "", fmt.Errorf("empty llm message content")
		}
		return value, nil
	case []any:
		var builder strings.Builder
		for _, part := range value {
			partMap, ok := part.(map[string]any)
			if !ok {
				continue
			}
			if partType, _ := partMap["type"].(string); partType == "text" {
				if text, ok := partMap["text"].(string); ok {
					builder.WriteString(text)
				}
			}
		}
		result := strings.TrimSpace(builder.String())
		if result == "" {
			return "", fmt.Errorf("empty llm message content")
		}
		return result, nil
	default:
		return "", fmt.Errorf("unsupported llm message content format")
	}
}

func normalizeJSONBlob(raw string) ([]byte, error) {
	trimmed := strings.TrimSpace(raw)
	if strings.HasPrefix(trimmed, "```") {
		trimmed = strings.TrimPrefix(trimmed, "```")
		trimmed = strings.TrimSpace(strings.TrimPrefix(trimmed, "json"))
		if end := strings.LastIndex(trimmed, "```"); end >= 0 {
			trimmed = strings.TrimSpace(trimmed[:end])
		}
	}
	if json.Valid([]byte(trimmed)) {
		return []byte(trimmed), nil
	}
	start := strings.Index(trimmed, "{")
	end := strings.LastIndex(trimmed, "}")
	if start >= 0 && end > start {
		candidate := strings.TrimSpace(trimmed[start : end+1])
		if json.Valid([]byte(candidate)) {
			return []byte(candidate), nil
		}
	}
	return nil, fmt.Errorf("response is not valid json")
}

func normalizeLLMOptions(raw json.RawMessage) ([]QuestionOption, error) {
	if len(raw) == 0 {
		return nil, fmt.Errorf("options field is required")
	}

	var mapShape map[string]string
	if err := json.Unmarshal(raw, &mapShape); err == nil {
		return normalizeOptionMap(mapShape)
	}

	var arrayShape []QuestionOption
	if err := json.Unmarshal(raw, &arrayShape); err == nil {
		byLabel := make(map[string]string, 4)
		for _, opt := range arrayShape {
			label := strings.ToUpper(strings.TrimSpace(opt.Label))
			if label == "" {
				continue
			}
			byLabel[label] = strings.TrimSpace(opt.Text)
		}
		return normalizeOptionMap(byLabel)
	}

	return nil, fmt.Errorf("options must be object or array")
}

func normalizeHasDiagram(raw json.RawMessage) (bool, error) {
	if len(raw) == 0 {
		return false, nil
	}

	var boolValue bool
	if err := json.Unmarshal(raw, &boolValue); err == nil {
		return boolValue, nil
	}

	var stringValue string
	if err := json.Unmarshal(raw, &stringValue); err == nil {
		normalized := strings.ToLower(strings.TrimSpace(stringValue))
		switch normalized {
		case "true", "1", "yes", "y":
			return true, nil
		case "false", "0", "no", "n", "":
			return false, nil
		default:
			return false, fmt.Errorf("invalid has_diagram string value %q", stringValue)
		}
	}

	var numberValue float64
	if err := json.Unmarshal(raw, &numberValue); err == nil {
		return numberValue != 0, nil
	}

	return false, fmt.Errorf("invalid has_diagram format")
}

func normalizeOptionMap(source map[string]string) ([]QuestionOption, error) {
	labels := []string{"A", "B", "C", "D"}
	options := make([]QuestionOption, 0, 4)
	for _, label := range labels {
		text := strings.TrimSpace(source[label])
		if text == "" {
			return nil, fmt.Errorf("option %s is missing or empty", label)
		}
		options = append(options, QuestionOption{Label: label, Text: text})
	}
	if len(source) != 4 {
		for key := range source {
			k := strings.ToUpper(strings.TrimSpace(key))
			if k != "A" && k != "B" && k != "C" && k != "D" {
				return nil, fmt.Errorf("invalid option label %q", key)
			}
		}
	}
	return options, nil
}

func validateQuestionFile(q QuestionFile, meta SourceMetadata, jsonPath string) error {
	if q.ID == "" {
		return fmt.Errorf("question id is required")
	}
	if q.TopicCode == "" || q.Topic == "" {
		return fmt.Errorf("topic code and topic name are required")
	}
	if len(q.Options) != 4 {
		return fmt.Errorf("expected 4 options, got %d", len(q.Options))
	}
	if q.CorrectAnswer != meta.CorrectAnswer {
		return fmt.Errorf("correct answer %q does not match filename answer %q", q.CorrectAnswer, meta.CorrectAnswer)
	}
	if q.QuestionNumber != meta.QuestionNumber {
		return fmt.Errorf("question number %d does not match filename question number %d", q.QuestionNumber, meta.QuestionNumber)
	}
	if q.Paper.Year != meta.Year || q.Paper.Month != meta.ExamMonth || q.Paper.Level != meta.Level || q.Paper.Timezone != meta.Timezone {
		return fmt.Errorf("paper metadata does not match source filename in %s", jsonPath)
	}
	if q.Paper.SessionLabel != meta.SessionLabel {
		return fmt.Errorf("session label %q does not match normalized %q", q.Paper.SessionLabel, meta.SessionLabel)
	}
	if q.Paper.PaperCode == "" {
		return fmt.Errorf("paper code is required")
	}
	seen := map[string]bool{}
	for _, option := range q.Options {
		if option.Label == "" || option.Text == "" {
			return fmt.Errorf("option label and text are required")
		}
		if seen[option.Label] {
			return fmt.Errorf("duplicate option label %q", option.Label)
		}
		seen[option.Label] = true
	}
	return nil
}

func topicIDFromCodeAndName(code, name string) string {
	return strings.ToLower(code) + "-" + slug(name)
}

func paperIDFromQuestion(q QuestionFile) string {
	parts := []string{strings.ToLower(q.Paper.Month), strconv.Itoa(q.Paper.Year), strings.ToLower(q.Paper.Level)}
	if q.Paper.Timezone != "" {
		parts = append(parts, strings.ToLower(q.Paper.Timezone))
	}
	parts = append(parts, slug(q.Paper.PaperCode), slug(q.Paper.SourceFilename))
	return strings.Join(parts, "-")
}

func slug(value string) string {
	value = strings.ToLower(value)
	replacer := strings.NewReplacer("&", " and ", ".", " ", "_", " ")
	value = replacer.Replace(value)
	fields := strings.FieldsFunc(value, func(r rune) bool {
		return (r < 'a' || r > 'z') && (r < '0' || r > '9')
	})
	return strings.Join(fields, "-")
}

func sqlEscape(value string) string {
	return strings.ReplaceAll(value, "'", "''")
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func parseTopicFolderName(name string) (code, topicName, topicSlug string, err error) {
	parts := strings.SplitN(name, "-", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", "", "", fmt.Errorf("invalid topic folder: %s", name)
	}
	code = parts[0]
	topicSlug = strings.ToLower(name)
	topicName = strings.ReplaceAll(parts[1], "-", " ")
	return code, topicName, topicSlug, nil
}

func buildQuestionID(meta SourceMetadata) string {
	parts := []string{meta.ExamMonth, strconv.Itoa(meta.Year), meta.Level}
	if meta.Timezone != "" {
		parts = append(parts, meta.Timezone)
	}
	parts = append(parts, fmt.Sprintf("Q%d", meta.QuestionNumber))
	return strings.Join(parts, "_")
}
