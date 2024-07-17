const APIUrl = 'http://127.0.0.1:8080'

document.addEventListener('DOMContentLoaded', () => {
    startHeartAnimation();
    checkBirthday();
});

async function fetchGameData() {
    const response = await fetch(APIUrl + '/game-data');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const gameData = await response.json();
    return gameData;
}

function checkBirthday() {
    const birthday = new Date('2024-07-21T00:00:00'); // Replace with the actual birthday
    const countdownElement = document.getElementById('countdown');
    const startGameButton = document.getElementById('start-game');

    // Update the countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Initial call to set the countdown immediately
    updateCountdown();

    function updateCountdown() {
        const now = new Date();
        const timeLeft = birthday - now;

        if (timeLeft <= 0) {
            countdownElement.classList.add('d-none');
            startGameButton.classList.remove('d-none');
            clearInterval(countdownInterval); // Stop the interval when the countdown ends
        } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            countdownElement.textContent = `Only ${days}d, ${hours}h, ${minutes}m, and ${seconds}s until Sonnie's special day!`;
        }
    }
}


async function startGame() {
    try {
        const gameData = await fetchGameData();
        loadQuestion(gameData, 0);
        document.getElementById('landing-page').classList.add('d-none');
        document.getElementById('game-page').classList.remove('d-none');
    } catch (error) {
        document.getElementById('landing-page').classList.remove('d-none');
        document.getElementById('game-page').classList.add('d-none');
        document.getElementById('error-message').textContent = 'Error loading game data. Please try again later.';
    }
}

function loadQuestion(gameData, currentQuestion) {
    if (currentQuestion < gameData.questions.length) {
        const question = gameData.questions[currentQuestion];
        document.getElementById('option1').src = question.img1;
        document.getElementById('option2').src = question.img2;
        document.getElementById('option1').onclick = () => checkAnswer(gameData, currentQuestion, 1);
        document.getElementById('option2').onclick = () => checkAnswer(gameData, currentQuestion, 2);
    } else {
        endGame(gameData, true);
    }
}

function checkAnswer(gameData, currentQuestion, selectedOption) {
    const correctOption = gameData.questions[currentQuestion].correct;
    if (selectedOption === correctOption) {
        loadQuestion(gameData, currentQuestion + 1);
    } else {
        endGame(gameData, false);
    }
}

const wishLines = [
    "Happy birthday to the one who's miles away but close to my heart. Wishing you a day filled with joy and love, even from afar.",
    "Distance may separate us physically, but our love knows no bounds. Happy birthday!",
    "Even though we're apart, my heart is with you every step of the way. Happy birthday, my dear.",
    "Distance may test us, but it can't diminish the love we share. Happy birthday!",
    "Wishing a very happy birthday to the love of my life. Though we may be separated by miles, our love binds us together.",
    "Happy birthday! Distance may be tough, but it's no match for the love we share.",
    "Happy birthday to my incredible partner. Here's to making every moment count when we're together again.",
    "Distance means so little when someone means so much. Happy birthday, my love.",
    "As long as we're under the same moon, I'll feel close to you. Happy birthday!",
    "No matter the miles that separate us, you're always with me in spirit. Happy birthday, sweetheart."
];

function endGame(gameData, won) {
    document.getElementById('game-page').classList.add('d-none');
    document.getElementById('end-page').classList.remove('d-none');
    document.getElementById('option1').removeAttribute("src");
    document.getElementById('option2').removeAttribute("src");

    const gameTitle = document.getElementById('game-title');

    // Select a random wish line
    const randomWishLine = wishLines[Math.floor(Math.random() * wishLines.length)];

    if (won) {
        gameTitle.textContent = 'Happy Birthday 🎂';
        document.getElementById('message').textContent = randomWishLine;
        document.getElementById('group-photo').src = gameData.groupPhoto;
        document.getElementById('message').classList.remove('d-none');
        document.getElementById('group-photo').classList.remove('d-none');
        startConfettiAnimation();
        // const winAudio = document.getElementById('win-audio'); // Get the audio element
        // winAudio.play(); // Play the romantic song
    } else {
        gameTitle.textContent = 'Oops! 💩';
        document.getElementById('message').classList.add('d-none');
        document.getElementById('group-photo').classList.add('d-none');
    }
}


function backToStart() {
    document.getElementById('game-title').textContent = 'Who is your boyfriend?';
    document.getElementById('end-page').classList.add('d-none');
    document.getElementById('landing-page').classList.remove('d-none');
}

function startConfettiAnimation() {
    const duration = 1.2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function startHeartAnimation() {
    const animationElement = document.getElementById('animation'); // Updated ID
    animationElement.innerHTML = ''; // Clear previous hearts

    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = `${i * 10}%`; // Ensure hearts are centered
        heart.style.animationDuration = `${Math.random() * 2 + 4}s`;
        const isBlack = Math.random() < 0.5;
        heart.style.backgroundColor = isBlack ? 'black' : 'white'; // Randomly assign black or white color
        heart.style.opacity = isBlack ? '0.7' : '0.8'; // Set opacity based on color
        animationElement.appendChild(heart);
    }
}