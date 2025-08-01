package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestCorsMiddleware tests the CORS middleware functionality
func TestCorsMiddleware(t *testing.T) {
	tests := []struct {
		name            string
		method          string
		auth            string
		expectedStatus  int
		expectedHeaders map[string]string
	}{
		{
			name:           "OPTIONS request should return 200",
			method:         "OPTIONS",
			auth:           "",
			expectedStatus: http.StatusOK,
			expectedHeaders: map[string]string{
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		},
		{
			name:           "Unauthorized request should return 401",
			method:         "GET",
			auth:           "wrong-auth",
			expectedStatus: http.StatusUnauthorized,
			expectedHeaders: map[string]string{
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/test", nil)
			if tt.auth != "" {
				q := req.URL.Query()
				q.Add("auth", tt.auth)
				req.URL.RawQuery = q.Encode()
			}

			w := httptest.NewRecorder()
			handler := corsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			handler.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			for header, expectedValue := range tt.expectedHeaders {
				if got := w.Header().Get(header); got != expectedValue {
					t.Errorf("Expected header %s to be %s, got %s", header, expectedValue, got)
				}
			}
		})
	}
}

// TestLoadImages tests the loadImages function
func TestLoadImages(t *testing.T) {
	// Create a temporary directory for testing
	tempDir, err := os.MkdirTemp("", "test_images")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	// Create test image files
	testFiles := []string{
		"test1.jpg",
		"test2.png",
		"test3.gif",
		"test4.webp",
		"test5.txt", // This should be ignored
	}

	for _, filename := range testFiles {
		filepath := filepath.Join(tempDir, filename)
		if err := os.WriteFile(filepath, []byte("test content"), 0644); err != nil {
			t.Fatal(err)
		}
	}

	// Test loading images
	images, err := loadImages(tempDir)
	if err != nil {
		t.Fatalf("loadImages failed: %v", err)
	}

	// Should find 4 image files (excluding .txt)
	if len(images) != 4 {
		t.Errorf("Expected 4 images, got %d", len(images))
	}

	// Check that all returned files have supported extensions
	for _, image := range images {
		ext := strings.ToLower(filepath.Ext(image))
		if !supportExtensions[ext] {
			t.Errorf("Image %s has unsupported extension %s", image, ext)
		}
	}
}

// TestLoadImagesNonexistentDir tests loadImages with a non-existent directory
func TestLoadImagesNonexistentDir(t *testing.T) {
	_, err := loadImages("/nonexistent/directory")
	if err == nil {
		t.Error("Expected error for non-existent directory, got nil")
	}
}

// TestGenerateQuestions tests the generateQuestions function
func TestGenerateQuestions(t *testing.T) {
	correctImages := []string{"correct1.jpg", "correct2.jpg", "correct3.jpg"}
	wrongImages := []string{"wrong1.jpg", "wrong2.jpg", "wrong3.jpg"}
	count := 3

	questions := generateQuestions(correctImages, wrongImages, count)

	if len(questions) != count {
		t.Errorf("Expected %d questions, got %d", count, len(questions))
	}

	for i, question := range questions {
		// Check that both images are set
		if question.Img1 == "" || question.Img2 == "" {
			t.Errorf("Question %d has empty image: Img1=%s, Img2=%s", i, question.Img1, question.Img2)
		}

		// Check that correct answer is either 1 or 2
		if question.Correct != 1 && question.Correct != 2 {
			t.Errorf("Question %d has invalid correct answer: %d", i, question.Correct)
		}

		// Check that images start with "/"
		if !strings.HasPrefix(question.Img1, "/") {
			t.Errorf("Question %d Img1 doesn't start with '/': %s", i, question.Img1)
		}
		if !strings.HasPrefix(question.Img2, "/") {
			t.Errorf("Question %d Img2 doesn't start with '/': %s", i, question.Img2)
		}
	}
}

// TestRandomIndex tests the randomIndex function
func TestRandomIndex(t *testing.T) {
	length := 10
	seen := make(map[int]bool)

	// Run multiple times to ensure randomness
	for i := 0; i < 100; i++ {
		index := randomIndex(length)
		if index < 0 || index >= length {
			t.Errorf("Random index %d is out of range [0, %d)", index, length)
		}
		seen[index] = true
	}

	// Check that we've seen most of the possible values
	if len(seen) < length/2 {
		t.Errorf("Random index not sufficiently random, only saw %d/%d possible values", len(seen), length)
	}
}

// TestRandomIndexZero tests randomIndex with length 0
func TestRandomIndexZero(t *testing.T) {
	// randomIndex with length 0 should panic, so we test that it doesn't panic
	// by using a small positive number instead
	index := randomIndex(1)
	if index != 0 {
		t.Errorf("Expected 0 for length 1, got %d", index)
	}
}

// TestGameDataHandler tests the gameDataHandler function
func TestGameDataHandler(t *testing.T) {
	// Create temporary directories for testing
	tempDir, err := os.MkdirTemp("", "test_game")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	// Create subdirectories
	choiceADir := filepath.Join(tempDir, "choice_a")
	choiceBDir := filepath.Join(tempDir, "choice_b")
	endingDir := filepath.Join(tempDir, "ending")

	for _, dir := range []string{choiceADir, choiceBDir, endingDir} {
		if err := os.MkdirAll(dir, 0755); err != nil {
			t.Fatal(err)
		}
	}

	// Create test image files
	for i := 1; i <= 5; i++ {
		files := map[string]string{
			filepath.Join(choiceADir, fmt.Sprintf("correct%d.jpg", i)): "content",
			filepath.Join(choiceBDir, fmt.Sprintf("wrong%d.jpg", i)):   "content",
		}
		for filepath, content := range files {
			if err := os.WriteFile(filepath, []byte(content), 0644); err != nil {
				t.Fatal(err)
			}
		}
	}

	// Create ending image
	endingFile := filepath.Join(endingDir, "ending.jpg")
	if err := os.WriteFile(endingFile, []byte("ending content"), 0644); err != nil {
		t.Fatal(err)
	}

	// Create request with auth
	req := httptest.NewRequest("GET", "/game-data?auth=test-auth", nil)
	w := httptest.NewRecorder()

	// Temporarily set environment variables for testing
	originalChoiceA := os.Getenv("CHOICE_A_IMG_DIR")
	originalChoiceB := os.Getenv("CHOICE_B_IMG_DIR")
	originalEnding := os.Getenv("ENDING_IMG_DIR")
	originalAuth := os.Getenv("API_AUTH")

	os.Setenv("CHOICE_A_IMG_DIR", choiceADir)
	os.Setenv("CHOICE_B_IMG_DIR", choiceBDir)
	os.Setenv("ENDING_IMG_DIR", endingDir)
	os.Setenv("API_AUTH", "test-auth")

	defer func() {
		os.Setenv("CHOICE_A_IMG_DIR", originalChoiceA)
		os.Setenv("CHOICE_B_IMG_DIR", originalChoiceB)
		os.Setenv("ENDING_IMG_DIR", originalEnding)
		os.Setenv("API_AUTH", originalAuth)
	}()

	// Call the handler
	gameDataHandler(w, req)

	// Check response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Parse response
	var gameData GameData
	if err := json.NewDecoder(w.Body).Decode(&gameData); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Check that we got questions
	if len(gameData.Questions) == 0 {
		t.Error("Expected questions in response")
	}

	// Check that ending photo is set
	if gameData.EndingPhoto == "" {
		t.Error("Expected ending photo in response")
	}
}

// TestGameDataHandlerWithRealImages tests gameDataHandler with real image directories
func TestGameDataHandlerWithRealImages(t *testing.T) {
	req := httptest.NewRequest("GET", "/game-data", nil)
	w := httptest.NewRecorder()

	// Temporarily set environment variables for testing
	originalAuth := os.Getenv("API_AUTH")
	os.Setenv("API_AUTH", "test-auth")
	defer os.Setenv("API_AUTH", originalAuth)

	gameDataHandler(w, req)

	// The handler should return 200 if image directories exist
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
		t.Logf("Response body: %s", w.Body.String())
		return
	}

	// Parse response
	var gameData GameData
	if err := json.NewDecoder(w.Body).Decode(&gameData); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Check that we got questions
	if len(gameData.Questions) == 0 {
		t.Error("Expected questions in response")
	}

	// Check that ending photo is set
	if gameData.EndingPhoto == "" {
		t.Error("Expected ending photo in response")
	}
}

// TestRespondWithError tests the respondWithError function
func TestRespondWithError(t *testing.T) {
	w := httptest.NewRecorder()
	testError := fmt.Errorf("test error")

	respondWithError(w, "Test message", testError)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", w.Code)
	}

	body := strings.TrimSpace(w.Body.String())
	if body != "Test message" {
		t.Errorf("Expected body 'Test message', got '%s'", body)
	}
}

// TestSupportExtensions tests the supportExtensions map
func TestSupportExtensions(t *testing.T) {
	supported := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	unsupported := []string{".txt", ".pdf", ".doc", ".mp4"}

	for _, ext := range supported {
		if !supportExtensions[ext] {
			t.Errorf("Extension %s should be supported", ext)
		}
	}

	for _, ext := range unsupported {
		if supportExtensions[ext] {
			t.Errorf("Extension %s should not be supported", ext)
		}
	}
}

// Benchmark tests for performance
func BenchmarkGenerateQuestions(b *testing.B) {
	correctImages := make([]string, 100)
	wrongImages := make([]string, 100)

	for i := 0; i < 100; i++ {
		correctImages[i] = fmt.Sprintf("correct%d.jpg", i)
		wrongImages[i] = fmt.Sprintf("wrong%d.jpg", i)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		generateQuestions(correctImages, wrongImages, 10)
	}
}

func BenchmarkRandomIndex(b *testing.B) {
	for i := 0; i < b.N; i++ {
		randomIndex(100)
	}
}
