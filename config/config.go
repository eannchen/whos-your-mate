package config

import (
	"os"
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
