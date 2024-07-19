package main

import (
	"encoding/json"
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
	authorization = "0721"
	minImgNumber  = 5
)

var (
	supportExtensions = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
)

func main() {
	fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/", fileServer)

	imageServer := http.StripPrefix("/images/", http.FileServer(http.Dir("./images")))
	http.Handle("/images/", corsMiddleware(imageServer))

	apiServer := http.HandlerFunc(gameDataHandler)
	http.Handle("/game-data", corsMiddleware(apiServer))

	http.ListenAndServe(":80", nil)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
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

func gameDataHandler(w http.ResponseWriter, r *http.Request) {

	// Load images
	youImages, err := loadImages("images/you")
	if err != nil {
		http.Error(w, "Could not read your images", http.StatusInternalServerError)
		log.Println("Error reading your images:", err)
		return
	}
	celebrityImages, err := loadImages("images/celebrities")
	if err != nil {
		http.Error(w, "Could not read celebrity images", http.StatusInternalServerError)
		log.Println("Error reading celebrity images:", err)
		return
	}
	groupPhotos, err := loadImages("images/groups")
	if err != nil {
		http.Error(w, "Could not read group images", http.StatusInternalServerError)
		log.Println("Error reading group images:", err)
		return
	}

	// Check if there are enough images
	if len(youImages) < minImgNumber || len(celebrityImages) < minImgNumber || len(groupPhotos) == 0 {
		http.Error(w, "Not enough images to create questions", http.StatusInternalServerError)
		log.Println("Not enough images. You:", len(youImages), "Celebrities:", len(celebrityImages), "Groups:", len(groupPhotos))
		return
	}

	randSource := rand.New(rand.NewSource(time.Now().UnixNano()))
	randSource.Shuffle(len(youImages), func(i, j int) { youImages[i], youImages[j] = youImages[j], youImages[i] })
	randSource.Shuffle(len(celebrityImages), func(i, j int) { celebrityImages[i], celebrityImages[j] = celebrityImages[j], celebrityImages[i] })

	questions := make([]Question, minImgNumber)
	for i := 0; i < minImgNumber; i++ {
		// Randomly assign the correct answer to either option 1 or 2
		correctOption := randSource.Intn(2) + 1 // 1 or 2
		if correctOption == 1 {
			questions[i] = Question{
				Img1:    "/" + youImages[i],
				Img2:    "/" + celebrityImages[i],
				Correct: 1,
			}
		} else {
			questions[i] = Question{
				Img1:    "/" + celebrityImages[i],
				Img2:    "/" + youImages[i],
				Correct: 2,
			}
		}
	}

	// Select a random group photo
	randomGroupPhoto := groupPhotos[randSource.Intn(len(groupPhotos))]

	gameData := GameData{
		Questions:  questions,
		GroupPhoto: "/" + randomGroupPhoto,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(gameData); err != nil {
		http.Error(w, "Could not encode game data", http.StatusInternalServerError)
		log.Println("Error encoding game data:", err)
	}
}

func loadImages(path string) ([]string, error) {
	images := make([]string, 0, minImgNumber)

	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(info.Name()))
			if supportExtensions[ext] {
				images = append(images, path)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return images, nil
}
