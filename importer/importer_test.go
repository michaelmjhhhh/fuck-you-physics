package importer

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestParseSourceFilename(t *testing.T) {
	t.Parallel()

	meta, err := ParseSourceFilename("May 2022 HL TZ1 Q10 A.png")
	if err != nil {
		t.Fatalf("ParseSourceFilename returned error: %v", err)
	}

	if meta.Year != 2022 {
		t.Fatalf("expected year 2022, got %d", meta.Year)
	}
	if meta.ExamMonth != "May" {
		t.Fatalf("expected exam month May, got %q", meta.ExamMonth)
	}
	if meta.Level != "HL" {
		t.Fatalf("expected level HL, got %q", meta.Level)
	}
	if meta.Timezone != "TZ1" {
		t.Fatalf("expected timezone TZ1, got %q", meta.Timezone)
	}
	if meta.QuestionNumber != 10 {
		t.Fatalf("expected question number 10, got %d", meta.QuestionNumber)
	}
	if meta.CorrectAnswer != "A" {
		t.Fatalf("expected correct answer A, got %q", meta.CorrectAnswer)
	}
}

func TestParseSourceFilenameWithoutQToken(t *testing.T) {
	t.Parallel()

	meta, err := ParseSourceFilename("May 2008 HL TZ2 16 D.png")
	if err != nil {
		t.Fatalf("ParseSourceFilename returned error: %v", err)
	}

	if meta.Year != 2008 || meta.ExamMonth != "May" || meta.Level != "HL" || meta.Timezone != "TZ2" || meta.QuestionNumber != 16 || meta.CorrectAnswer != "D" {
		t.Fatalf("unexpected metadata: %+v", meta)
	}
}

func TestImportJSONFile(t *testing.T) {
	t.Parallel()

	root := filepath.Dir(mustAbs(t, "."))
	dbPath := filepath.Join(t.TempDir(), "ib-physics.db")
	schemaPath := filepath.Join(root, "schema.sql")
	jsonPath := filepath.Join(root, "sample-question.json")

	if err := ImportJSONFile(dbPath, schemaPath, jsonPath); err != nil {
		t.Fatalf("ImportJSONFile returned error: %v", err)
	}

	questionCount := querySQLite(t, dbPath, "SELECT COUNT(*) FROM questions;")
	if questionCount != "1" {
		t.Fatalf("expected 1 question, got %q", questionCount)
	}

	optionCount := querySQLite(t, dbPath, "SELECT COUNT(*) FROM question_options;")
	if optionCount != "4" {
		t.Fatalf("expected 4 options, got %q", optionCount)
	}

	correctAnswer := querySQLite(t, dbPath, "SELECT correct_answer FROM questions WHERE id = 'May_2022_HL_TZ1_Q10';")
	if correctAnswer != "A" {
		t.Fatalf("expected correct answer A, got %q", correctAnswer)
	}

	topicID := querySQLite(t, dbPath, "SELECT topic_id FROM questions WHERE id = 'May_2022_HL_TZ1_Q10';")
	if topicID != "b1-thermal-energy-transfers" {
		t.Fatalf("expected topic id b1-thermal-energy-transfers, got %q", topicID)
	}

	paperRow := querySQLite(t, dbPath, "SELECT exam_month || '|' || level || '|' || timezone || '|' || source_filename FROM papers;")
	if paperRow != "May|HL|TZ1|May 2022 HL TZ1 Q10 A.png" {
		t.Fatalf("unexpected paper row %q", paperRow)
	}
}

func TestImportJSONFilesInDirectory(t *testing.T) {
	t.Parallel()

	root := filepath.Dir(mustAbs(t, "."))
	dbPath := filepath.Join(t.TempDir(), "batch-import.db")
	schemaPath := filepath.Join(root, "schema.sql")
	fixturesDir := filepath.Join(t.TempDir(), "fixtures")
	if err := os.MkdirAll(fixturesDir, 0o755); err != nil {
		t.Fatalf("MkdirAll failed: %v", err)
	}

	source := mustReadFile(t, filepath.Join(root, "sample-question.json"))
	firstJSON := strings.ReplaceAll(source, "May_2022_HL_TZ1_Q10", "May_2022_HL_TZ1_Q10_Copy1")
	firstPath := filepath.Join(fixturesDir, "question-1.json")
	if err := os.WriteFile(firstPath, []byte(firstJSON), 0o644); err != nil {
		t.Fatalf("WriteFile firstPath failed: %v", err)
	}

	secondJSON := source
	secondJSON = strings.ReplaceAll(secondJSON, "May_2022_HL_TZ1_Q10", "Nov_2016_HL_Q25")
	secondJSON = strings.ReplaceAll(secondJSON, "\"year\": 2022", "\"year\": 2016")
	secondJSON = strings.ReplaceAll(secondJSON, "\"month\": \"May\"", "\"month\": \"Nov\"")
	secondJSON = strings.ReplaceAll(secondJSON, "\"session_label\": \"May 2022\"", "\"session_label\": \"Nov 2016\"")
	secondJSON = strings.ReplaceAll(secondJSON, "\"timezone\": \"TZ1\"", "\"timezone\": \"\"")
	secondJSON = strings.ReplaceAll(secondJSON, "May 2022 HL TZ1 Q10 A.png", "Nov 2016 HL Q25 A.png")
	secondJSON = strings.ReplaceAll(secondJSON, "\"question_number\": 10", "\"question_number\": 25")
	secondPath := filepath.Join(fixturesDir, "question-2.json")
	if err := os.WriteFile(secondPath, []byte(secondJSON), 0o644); err != nil {
		t.Fatalf("WriteFile secondPath failed: %v", err)
	}

	count, err := ImportJSONFilesInDirectory(dbPath, schemaPath, fixturesDir)
	if err != nil {
		t.Fatalf("ImportJSONFilesInDirectory returned error: %v", err)
	}
	if count != 2 {
		t.Fatalf("expected 2 imported files, got %d", count)
	}

	questionCount := querySQLite(t, dbPath, "SELECT COUNT(*) FROM questions;")
	if questionCount != "2" {
		t.Fatalf("expected 2 questions, got %q", questionCount)
	}

	paperCount := querySQLite(t, dbPath, "SELECT COUNT(*) FROM papers;")
	if paperCount != "2" {
		t.Fatalf("expected 2 papers, got %q", paperCount)
	}
}

func TestGenerateExtractionManifests(t *testing.T) {
	t.Parallel()

	root := filepath.Dir(mustAbs(t, "."))
	sourceRoot := filepath.Join(t.TempDir(), "topics")
	outputRoot := filepath.Join(t.TempDir(), "manifests")

	mustMkdirAll(t, filepath.Join(sourceRoot, "A4-Rigid-Body-Mechanics"))
	mustMkdirAll(t, filepath.Join(sourceRoot, "B1-Thermal-Energy-Transfers"))
	mustWriteFile(t, filepath.Join(sourceRoot, "A4-Rigid-Body-Mechanics", "May 2000 HL Q10 C.png"), "")
	mustWriteFile(t, filepath.Join(sourceRoot, "B1-Thermal-Energy-Transfers", "Nov 2016 HL Q25 A.png"), "")

	count, err := GenerateExtractionManifests(sourceRoot, outputRoot)
	if err != nil {
		t.Fatalf("GenerateExtractionManifests returned error: %v", err)
	}
	if count != 2 {
		t.Fatalf("expected 2 manifests, got %d", count)
	}

	firstManifest := filepath.Join(outputRoot, "a4-rigid-body-mechanics", "May_2000_HL_Q10.json")
	secondManifest := filepath.Join(outputRoot, "b1-thermal-energy-transfers", "Nov_2016_HL_Q25.json")

	first := mustReadFile(t, firstManifest)
	if !strings.Contains(first, "\"topic_code\": \"A4\"") {
		t.Fatalf("first manifest missing topic code: %s", first)
	}
	if !strings.Contains(first, "\"correct_answer\": \"C\"") {
		t.Fatalf("first manifest missing correct answer: %s", first)
	}
	if !strings.Contains(first, "May 2000 HL Q10 C.png") {
		t.Fatalf("first manifest missing source filename: %s", first)
	}

	second := mustReadFile(t, secondManifest)
	if !strings.Contains(second, "\"topic\": \"Thermal Energy Transfers\"") {
		t.Fatalf("second manifest missing topic name: %s", second)
	}
	if !strings.Contains(second, "\"question_number\": 25") {
		t.Fatalf("second manifest missing question number: %s", second)
	}
	if !strings.Contains(second, "B1-Thermal-Energy-Transfers/Nov 2016 HL Q25 A.png") {
		t.Fatalf("second manifest missing source image path: %s", second)
	}

	_ = root
}

func mustAbs(t *testing.T, path string) string {
	t.Helper()
	abs, err := filepath.Abs(path)
	if err != nil {
		t.Fatalf("filepath.Abs failed: %v", err)
	}
	return abs
}

func querySQLite(t *testing.T, dbPath, sql string) string {
	t.Helper()
	cmd := exec.Command("sqlite3", dbPath, sql)
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("sqlite3 query failed: %v\n%s", err, string(out))
	}
	return strings.TrimSpace(string(out))
}

func mustReadFile(t *testing.T, path string) string {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("ReadFile failed: %v", err)
	}
	return string(data)
}

func mustMkdirAll(t *testing.T, path string) {
	t.Helper()
	if err := os.MkdirAll(path, 0o755); err != nil {
		t.Fatalf("MkdirAll failed: %v", err)
	}
}

func mustWriteFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}
}
