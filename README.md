# Who's Your Mate

A small, humored web project built as a birthday gift, using Go, Vanilla JS (ES6), and Docker.  No frameworks are used.

## Features
- Lightweight and easy to run
- No frontend frameworks—just Vanilla JS (ES6)
- Simple Go backend
- Simple containerized deployment via Docker


## Project Structure

```txt
.
├── config/             # Go config files
├── images/             # Static images
├── static/             # Frontend JS, CSS, HTML
├── main.go             # Go backend entry point
├── dockerfile          # Docker build file
├── docker-compose.yml  # For running application on your host
├── makefile            # Scripts for fast deployment
└── env.example.sh      # Example environment variables
```


## Getting Started

### Prerequisites
- Go 1.18+ installed
- Docker installed on local and host (optional, for containerized deployment)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/whos-your-mate.git
   cd esl-toolkit
   ```

2. **Set up your environment variables:**
   - Setup Go server env

     Which is used for the app simple authentication.
     ```sh
     cp .env.example .env
     # Edit .env to set your Go server environment variables
     ```
   - Setup JavaScript env

     Which is used for texts and display on the frontend.
     ```sh
     cp static/config.example.js static/config.js
     # Edit config.js to set your JavaScript client environment variables
     ```

3. **Add Photos**

    Add images to folders `/images/choice_a`, `/images/choice_b`, and `/images/ending`. Which is used for display on the frontend.

4. **Install Go dependencies:**
   ```sh
   go mod tidy
   ```

5. **Run the app locally**
   ```sh
   go run main.go
   ```

6. **Access the app**

   Open your browser and go to http://localhost:8080.


### Deployment

You can deploy this app to any server that supports Docker.

1. **Set up your host server variables:**
    ```sh
     cp env.example.sh env.sh
     # Edit env.sh to set your host information
    ```

2. **Containerized the app and deploy**
    ```sh
     make deploy
    ```

3. **Run the app on the host**

    On your host server, use docker compose to run the application.
    ```sh
    docker compose up -d
    ```

## License
This project is a personal gift and learning project.
Feel free to use or adapt it for your own fun projects!
