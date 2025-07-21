package config

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
)

type env struct {
	Port          int
	APIAuth       string
	StaticDir     string
	ImagesDir     string
	ChoiceAImgDir string
	ChoiceBImgDir string
	EndingImgDir  string
	QuestionCount int
}

var (
	envInstance *env
	once        sync.Once
)

func Env() *env {
	once.Do(func() {
		if err := loadDotEnv(".env"); err != nil {
			fmt.Println("Error loading .env file:", err)
		}
		envInstance = &env{
			Port:          80,
			APIAuth:       os.Getenv("API_AUTH"),
			StaticDir:     "./static",
			ImagesDir:     "./images",
			ChoiceAImgDir: "./images/choice_a",
			ChoiceBImgDir: "./images/choice_b",
			EndingImgDir:  "./images/ending",
			QuestionCount: 5,
		}
	})
	return envInstance
}

func loadDotEnv(filepath string) error {
	file, err := os.Open(filepath)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()

		// Skip comments and empty lines
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}

		// Split key and value
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue // ignore malformed lines
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])

		// Remove optional surrounding quotes
		val = strings.Trim(val, `"'`)

		os.Setenv(key, val)
	}

	return scanner.Err()
}
