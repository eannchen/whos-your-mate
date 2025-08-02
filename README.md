# Who's Your Mate

A fun, interactive web game built as a birthday gift using Go, Vanilla JavaScript (ES6), and Docker. This project presents users with image comparison challenges in a lightweight, containerized application.

## Game Demo

<div align="center">
  <img src="documents/demo.gif" alt="Game Demo">
</div>

## Game Mechanics

1. **Question Generation**: The server randomly selects images from your configured directories
2. **Image Comparison**: Players see two images side by side
3. **Choice Making**: Players select which image matches the game's criteria
4. **Loading Experience**: Custom messages are displayed while the game loads
5. **Celebration**: A random ending image and personalized message are shown upon completion

## Getting Started

### Prerequisites

- **Go 1.18+** - [Download here](https://golang.org/dl/)
- **Docker** (optional, for containerized deployment) - [Download here](https://www.docker.com/products/docker-desktop/)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/whos-your-mate.git
   cd whos-your-mate
   ```

2. **Set up environment variables:**
   ```bash
   # Copy and edit the environment template
   cp env.example.sh .env
   # Edit .env with your configuration
   ```

3. **Configure frontend settings:**
   ```bash
   # Copy and edit the frontend config
   cp static/config.example.js static/config.js
   # Edit config.js with your game settings
   ```

4. **Add your game images:**
   ```bash
   # Add images to these directories:
   # - images/choice_a/ (correct answers)
   # - images/choice_b/ (wrong answers)
   # - images/ending/ (celebration images)
   ```

5. **Install dependencies:**
   ```bash
   go mod tidy
   ```

6. **Run the application:**
   ```bash
   go run main.go
   ```

7. **Access the game:**
   Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

### Configuration

#### Backend Configuration (`.env`)
```bash
# API Authentication
API_AUTH=your-secret-key-here
```

#### Frontend Configuration (`static/config.js`)
```javascript
export const APP_TITLE = "<APP_TITLE>";
export const MADE_BY = "<MADE_BY>";
export const SPECIAL_PERSON = "<SPECIAL_PERSON>";
export const SPECIAL_DAY = "2000-10-10T10:10:10";

// Customize the ending celebration messages
export const WISH_LINES = [
    "Example wish line 1",
    "Example wish line 2",
    "Example wish line 3",
];

// Customize the loading screen messages
export const LOADING_TEXTS = [
    "Example loading text 1",
    "Example loading text 2",
    "Example loading text 3"
];
```

**💡 Personalization Tips:**
- **`WISH_LINES`**: Add your own heartfelt messages that will appear at the end of the game
- **`LOADING_TEXTS`**: Create fun, engaging messages that show while the game loads
- You can add as many lines as you want - the game will randomly select from these arrays
- Make the messages personal and meaningful for your special person!


## Docker Deployment

The deployment requires Docker installed on your local and host server.

1. **Set up your host server:**
   ```bash
   cp env.example.sh env.sh
   # Edit env.sh with your production settings
   ```

2. **Deploy using Makefile:**
   ```bash
   make deploy
   ```

3. **Start the application on your server:**
   ```bash
   docker-compose up -d
   ```

## Customization

1. **Backend Changes**: Modify `main.go` and add tests in `main_test.go`
2. **Frontend Changes**: Update files in the `static/` directory
3. **Images**: Replace images in the `images/` directories


## Project Structure

```
whos-your-mate/
├── config/                # Configuration management
│   ├── config.go          # Environment and app config
│   └── config_test.go     # Configuration tests
├── images/                # Game images
│   ├── choice_a/          # Correct answer images
│   ├── choice_b/          # Wrong answer images
│   └── ending/            # Ending celebration images
├── static/                # Frontend assets
│   ├── index.html         # Main game interface
│   ├── app.js             # Game logic
│   ├── styles.css         # Styling
│   ├── config.example.js  # Frontend configuration template
│   ├── configLoader.js    # Frontend configuration loader
│   └── gameUtils.js       # Game utilities
├── main.go                # Go server entry point
├── main_test.go           # Main package tests
├── dockerfile             # Docker build configuration
├── docker-compose.yml     # Container orchestration
├── makefile               # Test and deployment scripts
├── go.mod                 # Go module dependencies
├── env.example.sh         # Environment variables template
└── README.md              # This file
```

## License

This project is a personal gift and learning project. Feel free to use or adapt it for your own fun projects!