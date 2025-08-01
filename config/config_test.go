package config

import (
	"os"
	"path/filepath"
	"sync"
	"testing"
)

// TestEnv tests the singleton pattern and default values
func TestEnv(t *testing.T) {
	// Clear any existing environment variables that might interfere
	originalAuth := os.Getenv("API_AUTH")
	os.Unsetenv("API_AUTH")
	defer os.Setenv("API_AUTH", originalAuth)

	// Get environment instance
	env := Env()

	// Test default values
	if env.APIAuth != "" {
		t.Errorf("Expected APIAuth to be empty, got %s", env.APIAuth)
	}

	// Test singleton pattern - should return the same instance
	env2 := Env()
	if env != env2 {
		t.Error("Env() should return the same instance (singleton pattern)")
	}
}

// TestEnvWithEnvironmentVariable tests environment variable loading
func TestEnvWithEnvironmentVariable(t *testing.T) {
	// Set environment variable
	originalAuth := os.Getenv("API_AUTH")
	os.Setenv("API_AUTH", "test-auth-token")
	defer os.Setenv("API_AUTH", originalAuth)

	// Reset the singleton to test with new environment
	envInstance = nil
	once = sync.Once{}

	// Get environment instance
	env := Env()

	// Test that environment variable is loaded
	if env.APIAuth != "test-auth-token" {
		t.Errorf("Expected APIAuth to be 'test-auth-token', got %s", env.APIAuth)
	}
}

// TestLoadDotEnv tests the loadDotEnv function
func TestLoadDotEnv(t *testing.T) {
	// Create a temporary .env file
	tempDir, err := os.MkdirTemp("", "test_env")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	envFile := filepath.Join(tempDir, ".env")
	envContent := `# This is a comment
API_AUTH=test-auth-from-file
PORT=9000
# Another comment

EMPTY_VAR=
QUOTED_VAR="quoted value"
SINGLE_QUOTED_VAR='single quoted value'
MALFORMED_LINE=no equals sign here
`

	if err := os.WriteFile(envFile, []byte(envContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Test loading the .env file
	err = loadDotEnv(envFile)
	if err != nil {
		t.Fatalf("loadDotEnv failed: %v", err)
	}

	// Check that environment variables were set
	if got := os.Getenv("API_AUTH"); got != "test-auth-from-file" {
		t.Errorf("Expected API_AUTH to be 'test-auth-from-file', got %s", got)
	}

	if got := os.Getenv("PORT"); got != "9000" {
		t.Errorf("Expected PORT to be '9000', got %s", got)
	}

	if got := os.Getenv("EMPTY_VAR"); got != "" {
		t.Errorf("Expected EMPTY_VAR to be empty, got %s", got)
	}

	if got := os.Getenv("QUOTED_VAR"); got != "quoted value" {
		t.Errorf("Expected QUOTED_VAR to be 'quoted value', got %s", got)
	}

	if got := os.Getenv("SINGLE_QUOTED_VAR"); got != "single quoted value" {
		t.Errorf("Expected SINGLE_QUOTED_VAR to be 'single quoted value', got %s", got)
	}
}

// TestLoadDotEnvNonexistentFile tests loadDotEnv with a non-existent file
func TestLoadDotEnvNonexistentFile(t *testing.T) {
	err := loadDotEnv("/nonexistent/.env")
	if err == nil {
		t.Error("Expected error for non-existent file, got nil")
	}
}

// TestLoadDotEnvEmptyFile tests loadDotEnv with an empty file
func TestLoadDotEnvEmptyFile(t *testing.T) {
	// Create a temporary empty .env file
	tempDir, err := os.MkdirTemp("", "test_env")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	envFile := filepath.Join(tempDir, ".env")
	if err := os.WriteFile(envFile, []byte(""), 0644); err != nil {
		t.Fatal(err)
	}

	err = loadDotEnv(envFile)
	if err != nil {
		t.Fatalf("loadDotEnv failed with empty file: %v", err)
	}
}

// TestLoadDotEnvWithCommentsAndEmptyLines tests loadDotEnv with various line types
func TestLoadDotEnvWithCommentsAndEmptyLines(t *testing.T) {
	// Create a temporary .env file
	tempDir, err := os.MkdirTemp("", "test_env")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	envFile := filepath.Join(tempDir, ".env")
	envContent := `# Comment at the top

# Another comment
TEST_VAR=test_value

# Comment in the middle

ANOTHER_VAR=another_value
# Comment at the end
`

	if err := os.WriteFile(envFile, []byte(envContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Test loading the .env file
	err = loadDotEnv(envFile)
	if err != nil {
		t.Fatalf("loadDotEnv failed: %v", err)
	}

	// Check that only valid variables were set
	if got := os.Getenv("TEST_VAR"); got != "test_value" {
		t.Errorf("Expected TEST_VAR to be 'test_value', got %s", got)
	}

	if got := os.Getenv("ANOTHER_VAR"); got != "another_value" {
		t.Errorf("Expected ANOTHER_VAR to be 'another_value', got %s", got)
	}
}

// TestLoadDotEnvWithMalformedLines tests loadDotEnv with malformed lines
func TestLoadDotEnvWithMalformedLines(t *testing.T) {
	// Create a temporary .env file
	tempDir, err := os.MkdirTemp("", "test_env")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	envFile := filepath.Join(tempDir, ".env")
	envContent := `VALID_VAR=valid_value
MALFORMED_LINE
ANOTHER_VALID_VAR=another_valid_value
=no_key
KEY_ONLY=
MALFORMED_LINE=no equals sign here
`

	if err := os.WriteFile(envFile, []byte(envContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Test loading the .env file
	err = loadDotEnv(envFile)
	if err != nil {
		t.Fatalf("loadDotEnv failed: %v", err)
	}

	// Check that only valid variables were set
	if got := os.Getenv("VALID_VAR"); got != "valid_value" {
		t.Errorf("Expected VALID_VAR to be 'valid_value', got %s", got)
	}

	if got := os.Getenv("ANOTHER_VALID_VAR"); got != "another_valid_value" {
		t.Errorf("Expected ANOTHER_VALID_VAR to be 'another_valid_value', got %s", got)
	}

	// Check that malformed lines were ignored
	if got := os.Getenv("MALFORMED_LINE"); got != "no equals sign here" {
		t.Errorf("Expected MALFORMED_LINE to be 'no equals sign here', got %s", got)
	}

	if got := os.Getenv(""); got != "" {
		t.Errorf("Expected empty key to be empty, got %s", got)
	}

	if got := os.Getenv("KEY_ONLY"); got != "" {
		t.Errorf("Expected KEY_ONLY to be empty, got %s", got)
	}
}

// Benchmark tests for performance
func BenchmarkEnv(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Env()
	}
}

func BenchmarkLoadDotEnv(b *testing.B) {
	// Create a temporary .env file for benchmarking
	tempDir, err := os.MkdirTemp("", "bench_env")
	if err != nil {
		b.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	envFile := filepath.Join(tempDir, ".env")
	envContent := `API_AUTH=benchmark-auth
PORT=8080
TEST_VAR=test_value
`

	if err := os.WriteFile(envFile, []byte(envContent), 0644); err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		loadDotEnv(envFile)
	}
}
