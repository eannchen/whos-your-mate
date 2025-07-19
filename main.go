package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"whos-your-mate/config"
)

type Question struct {
	Img1    string `json:"img1"`
	Img2    string `json:"img2"`
	Correct int    `json:"correct"` // 1 or 2 indicating the correct option
}

type GameData struct {
	Questions   []Question `json:"questions"`
	EndingPhoto string     `json:"endingPhoto"`
}

var supportExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
}

func main() {
	http.Handle("/", http.FileServer(http.Dir(config.Env().StaticDir)))
	http.Handle("/images/", corsMiddleware(http.StripPrefix("/images/", http.FileServer(http.Dir(config.Env().ImagesDir)))))
	http.Handle("/game-data", corsMiddleware(http.HandlerFunc(gameDataHandler)))
	log.Printf("Server started at %d\n", config.Env().Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", config.Env().Port), nil))
}

// corsMiddleware adds CORS headers and checks authorization
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		if r.URL.Query().Get("auth") != config.Env().APIAuth {
			fmt.Println(config.Env().APIAuth)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// gameDataHandler serves randomized game data as JSON
func gameDataHandler(w http.ResponseWriter, r *http.Request) {
	correctImages, err := loadImages(config.Env().ChoiceAImgDir)
	if err != nil {
		respondWithError(w, "Could not read your images", err)
		return
	}
	wrongImages, err := loadImages(config.Env().ChoiceBImgDir)
	if err != nil {
		respondWithError(w, "Could not read celebrity images", err)
		return
	}
	endingPhotos, err := loadImages(config.Env().EndingImgDir)
	if err != nil {
		respondWithError(w, "Could not read ending images", err)
		return
	}

	questionCount := config.Env().QuestionCount
	if len(correctImages) < questionCount || len(wrongImages) < questionCount || len(endingPhotos) == 0 {
		err := fmt.Errorf("Not enough images. Correct Images: %d, Wrong Images: %d, Ending Images: %d", len(correctImages), len(wrongImages), len(endingPhotos))
		respondWithError(w, "Not enough images to create questions", err)
		return
	}

	questions := generateQuestions(correctImages, wrongImages, questionCount)
	endingPhoto := "/" + endingPhotos[randomIndex(len(endingPhotos))]

	gameData := GameData{
		Questions:   questions,
		EndingPhoto: endingPhoto,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(gameData); err != nil {
		respondWithError(w, "Could not encode game data", err)
	}
}

// loadImages returns a slice of relative image paths in the given directory
func loadImages(dir string) ([]string, error) {
	var images []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(info.Name()))
			if supportExtensions[ext] {
				relPath := strings.TrimPrefix(path, "./")
				images = append(images, relPath)
			}
		}
		return nil
	})
	return images, err
}

// generateQuestions creates randomized questions for the game
func generateQuestions(correctImages, wrongImagesImages []string, count int) []Question {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	r.Shuffle(len(correctImages), func(i, j int) {
		correctImages[i], correctImages[j] = correctImages[j], correctImages[i]
	})
	r.Shuffle(len(wrongImagesImages), func(i, j int) {
		wrongImagesImages[i], wrongImagesImages[j] = wrongImagesImages[j], wrongImagesImages[i]
	})

	questions := make([]Question, count)
	for i := 0; i < count; i++ {
		correctOption := r.Intn(2) + 1 // 1 or 2
		if correctOption == 1 {
			questions[i] = Question{
				Img1:    "/" + correctImages[i],
				Img2:    "/" + wrongImagesImages[i],
				Correct: 1,
			}
		} else {
			questions[i] = Question{
				Img1:    "/" + wrongImagesImages[i],
				Img2:    "/" + correctImages[i],
				Correct: 2,
			}
		}
	}
	return questions
}

// randomIndex returns a random index for a slice of given length
func randomIndex(length int) int {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return r.Intn(length)
}

// respondWithError logs the error and sends an HTTP error response
func respondWithError(w http.ResponseWriter, msg string, err error) {
	http.Error(w, msg, http.StatusInternalServerError)
	log.Println(msg+":", err)
}
