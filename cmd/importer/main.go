package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"fuck-you-ib/importer"
)

func main() {
	dbPath := flag.String("db", "./ib_physics.db", "path to sqlite database")
	schemaPath := flag.String("schema", "./schema.sql", "path to schema.sql")
	inputPath := flag.String("input", "./sample-question.json", "path to canonical question json")
	manifestSource := flag.String("manifest-source", "", "source root containing topic image folders")
	manifestOutput := flag.String("manifest-output", "", "output directory for generated extraction manifests")
	llmManifestIndex := flag.String("llm-manifest-index", "", "path to manifest-index.json")
	llmManifestRoot := flag.String("llm-manifest-root", "", "root directory containing per-question manifest json files")
	llmSourceRoot := flag.String("llm-source-root", "", "root directory containing original source images")
	llmOutputDir := flag.String("llm-output-dir", "", "output directory for extracted canonical question json files")
	llmAPIBase := flag.String("llm-api-base", "", "OpenAI-compatible API base URL, e.g. https://api.siliconrouter.com/v1")
	llmAPIKey := flag.String("llm-api-key", "", "OpenAI-compatible API key")
	llmModel := flag.String("llm-model", "", "model name, e.g. kimi-k2.5")
	llmImport := flag.Bool("llm-import", false, "import successfully extracted question json files into sqlite")
	llmLimit := flag.Int("llm-limit", 0, "optional limit for number of manifest items to process (0 means all)")
	llmWorkers := flag.Int("llm-workers", 4, "number of concurrent workers for llm extraction")
	llmRequestTimeoutSeconds := flag.Int("llm-request-timeout-seconds", 60, "per-request timeout for llm api calls in seconds")
	flag.Parse()

	if *llmManifestIndex != "" || *llmManifestRoot != "" || *llmSourceRoot != "" || *llmOutputDir != "" || *llmAPIBase != "" || *llmModel != "" || *llmImport {
		cfg := importer.LLMExtractionConfig{
			ManifestIndexPath: *llmManifestIndex,
			ManifestRoot:      *llmManifestRoot,
			SourceRoot:        *llmSourceRoot,
			OutputDir:         *llmOutputDir,
			APIBaseURL:        *llmAPIBase,
			APIKey:            *llmAPIKey,
			Model:             *llmModel,
			Limit:             *llmLimit,
			Workers:           *llmWorkers,
			RequestTimeout:    time.Duration(*llmRequestTimeoutSeconds) * time.Second,
			ImportToSQLite:    *llmImport,
			DBPath:            *dbPath,
			SchemaPath:        *schemaPath,
		}

		result, err := importer.RunLLMExtraction(cfg)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}

		fmt.Printf("llm extraction processed=%d succeeded=%d rejected=%d imported=%d output=%s\n", result.Processed, result.Succeeded, result.Rejected, result.Imported, filepath.Clean(*llmOutputDir))
		if len(result.Errors) > 0 {
			fmt.Fprintln(os.Stderr, "reject reasons:")
			for _, reason := range result.Errors {
				fmt.Fprintf(os.Stderr, "- %s\n", reason)
			}
		}
		return
	}

	if *manifestSource != "" || *manifestOutput != "" {
		if *manifestSource == "" || *manifestOutput == "" {
			fmt.Fprintln(os.Stderr, "both -manifest-source and -manifest-output are required")
			os.Exit(1)
		}
		count, err := importer.GenerateExtractionManifests(*manifestSource, *manifestOutput)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		fmt.Printf("generated %d extraction manifests in %s\n", count, filepath.Clean(*manifestOutput))
		return
	}

	info, err := os.Stat(*inputPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	if info.IsDir() {
		count, err := importer.ImportJSONFilesInDirectory(*dbPath, *schemaPath, *inputPath)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		fmt.Printf("imported %d json files from %s into %s\n", count, filepath.Clean(*inputPath), *dbPath)
		return
	}

	if err := importer.ImportJSONFile(*dbPath, *schemaPath, *inputPath); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	fmt.Printf("imported %s into %s\n", *inputPath, *dbPath)
}
