package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"path/filepath"
	"time"
)

type Question struct {
	Img1    string `json:"img1"`
	Img2    string `json:"img2"`
	Correct int    `json:"correct"` // 1 or 2 indicating the correct option

}

func main() {
	http.Handle("/game-data", corsMiddleware(gameDataHandler))

	fileServer := http.StripPrefix("/images/", http.FileServer(http.Dir("./images")))
	http.Handle("/images/", corsMiddleware2(fileServer))

	http.ListenAndServe(":8080", nil)
}

func corsMiddleware(next func(w http.ResponseWriter, r *http.Request)) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	})
}

func corsMiddleware2(next http.Handler) http.Handler {
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

	// Check if there are enough images
	if len(youImages) < 5 || len(celebrityImages) < 5 {
		http.Error(w, "Not enough images to create questions", http.StatusInternalServerError)
		log.Println("Not enough images. You:", len(youImages), "Celebrities:", len(celebrityImages))
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func loadImages(path string) ([]string, error) {
	jpgImages, err := filepath.Glob(filepath.Join(path, "*.jpg"))
	if err != nil {
		return nil, err
	}

	jpegImages, err := filepath.Glob(filepath.Join(path, "*.jpeg"))
	if err != nil {
		return nil, err
	}

	images := append(jpgImages, jpegImages...)
	return images, nil
}
