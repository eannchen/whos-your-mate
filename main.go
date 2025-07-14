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
)

type Question struct {
	Img1    string `json:"img1"`
	Img2    string `json:"img2"`
	Correct int    `json:"correct"` // 1 or 2 indicating the correct option
}

type GameData struct {
	Questions  []Question `json:"questions"`
	GroupPhoto string     `json:"groupPhoto"`
}

const (
	authorization    = "0721"
	minImgNumber     = 5
	youDir           = "images/you"
	celebritiesDir   = "images/celebrities"
	groupsDir        = "images/groups"
	staticDir        = "./static"
	imagesDir        = "./images"
	apiListenAddress = ":80"
)

var supportExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
}

func main() {
	http.Handle("/", http.FileServer(http.Dir(staticDir)))
	http.Handle("/images/", corsMiddleware(http.StripPrefix("/images/", http.FileServer(http.Dir(imagesDir)))))
	http.Handle("/game-data", corsMiddleware(http.HandlerFunc(gameDataHandler)))
	log.Printf("Server started at %s\n", apiListenAddress)
	log.Fatal(http.ListenAndServe(apiListenAddress, nil))
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
		if r.URL.Query().Get("auth") != authorization {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// gameDataHandler serves randomized game data as JSON
func gameDataHandler(w http.ResponseWriter, r *http.Request) {
	youImages, err := loadImages(youDir)
	if err != nil {
		respondWithError(w, "Could not read your images", err)
		return
	}
	celebrityImages, err := loadImages(celebritiesDir)
	if err != nil {
		respondWithError(w, "Could not read celebrity images", err)
		return
	}
	groupPhotos, err := loadImages(groupsDir)
	if err != nil {
		respondWithError(w, "Could not read group images", err)
		return
	}

	if len(youImages) < minImgNumber || len(celebrityImages) < minImgNumber || len(groupPhotos) == 0 {
		err := fmt.Errorf("Not enough images. You: %d, Celebrities: %d, Groups: %d", len(youImages), len(celebrityImages), len(groupPhotos))
		respondWithError(w, "Not enough images to create questions", err)
		return
	}

	questions := generateQuestions(youImages, celebrityImages, minImgNumber)
	groupPhoto := "/" + groupPhotos[randomIndex(len(groupPhotos))]

	gameData := GameData{
		Questions:  questions,
		GroupPhoto: groupPhoto,
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
func generateQuestions(youImages, celebImages []string, count int) []Question {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	r.Shuffle(len(youImages), func(i, j int) { youImages[i], youImages[j] = youImages[j], youImages[i] })
	r.Shuffle(len(celebImages), func(i, j int) { celebImages[i], celebImages[j] = celebImages[j], celebImages[i] })

	questions := make([]Question, count)
	for i := 0; i < count; i++ {
		correctOption := r.Intn(2) + 1 // 1 or 2
		if correctOption == 1 {
			questions[i] = Question{
				Img1:    "/" + youImages[i],
				Img2:    "/" + celebImages[i],
				Correct: 1,
			}
		} else {
			questions[i] = Question{
				Img1:    "/" + celebImages[i],
				Img2:    "/" + youImages[i],
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
