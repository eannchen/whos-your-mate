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

func main() {
	apiServer := http.HandlerFunc(gameDataHandler)
	http.Handle("/game-data", corsMiddleware(apiServer))

	fileServer := http.StripPrefix("/images/", http.FileServer(http.Dir("./images")))
	http.Handle("/images/", corsMiddleware(fileServer))

	http.ListenAndServe(":8080", nil)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func gameDataHandler(w http.ResponseWriter, r *http.Request) {
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
	if len(youImages) < 5 || len(celebrityImages) < 5 || len(groupPhotos) == 0 {
		http.Error(w, "Not enough images to create questions", http.StatusInternalServerError)
		log.Println("Not enough images. You:", len(youImages), "Celebrities:", len(celebrityImages), "Groups:", len(groupPhotos))
		return
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(youImages), func(i, j int) { youImages[i], youImages[j] = youImages[j], youImages[i] })
	rand.Shuffle(len(celebrityImages), func(i, j int) { celebrityImages[i], celebrityImages[j] = celebrityImages[j], celebrityImages[i] })

	questions := make([]Question, 5)
	for i := 0; i < 5; i++ {
		// Randomly assign the correct answer to either option 1 or 2
		correctOption := rand.Intn(2) + 1 // 1 or 2
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
	randomGroupPhoto := groupPhotos[rand.Intn(len(groupPhotos))]

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
	var images []string
	extensions := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}

	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(info.Name()))
			if extensions[ext] {
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
