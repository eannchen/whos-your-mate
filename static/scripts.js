const APIUrl = 'http://127.0.0.1:80'

let password = ''; // Global variable to store the password


document.addEventListener('DOMContentLoaded', () => {
    startHeartAnimation();
    checkBirthday();
});

function checkBirthday() {
    const birthday = new Date('2024-07-10T12:00:00'); // Replace with the actual birthday
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

async function fetchGameData() {
    const response = await fetch(APIUrl + '/game-data', {
        headers: {
            'Authorization': password
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const gameData = await response.json();
    preloadImages(gameData); // Preload all images
    return gameData;
}

function preloadImages(gameData) {
    const preloadContainer = document.getElementById('preload-images');
    gameData.questions.forEach(question => {
        const img1 = document.createElement('img');
        const img2 = document.createElement('img');
        img1.src = question.img1;
        img2.src = question.img2;
        preloadContainer.appendChild(img1);
        preloadContainer.appendChild(img2);
    });
    const groupPhoto = document.createElement('img');
    groupPhoto.src = gameData.groupPhoto;
    preloadContainer.appendChild(groupPhoto);
}

function showPasswordInput() {
    document.getElementById('password').classList.remove('d-none');
    document.getElementById('password-button').classList.remove('d-none');

    document.getElementById('start-game').classList.add('d-none');
}

function setPassword() {
    const passwordInput = document.getElementById('password');
    password = passwordInput.value;
    startGame();
}


async function startGame() {
    try {
        showLoadingPage(); // Show loading page
        const gameData = await fetchGameData();
        await loadQuestion(gameData, 0);
        document.getElementById('landing-page').classList.add('d-none');
        document.getElementById('game-page').classList.remove('d-none');

        // reset state
        document.getElementById('password').classList.add('d-none');
        document.getElementById('password-button').classList.add('d-none');
        hideLoadingPage(); // Hide loading page

        document.getElementById('start-game').classList.remove('d-none');
    } catch (error) {
        document.getElementById('landing-page').classList.remove('d-none');
        document.getElementById('game-page').classList.add('d-none');
        document.getElementById('error-message').textContent = 'Error loading game data. The password might be wrong!';
    }
}

function showLoadingPage() {
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = getRandomLoadingText();
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('d-none');
}

function hideLoadingPage() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('d-none');
}

const loadingTexts = [
    "Hold tight, magic is happening!",
    "Getting things ready just for you...",
    "Almost there, stay tuned!",
    "Fetching some awesomeness...",
    "Loading... the best things come to those who wait!",
    "Making sure everything is perfect...",
    "Good things take time, almost done!",
    "Hold on, sprinkling some magic dust...",
    "Patience is a virtue, loading...",
    "Getting things ready for you, hang tight!"
];

function getRandomLoadingText() {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
}

async function loadQuestion(gameData, currentQuestion) {
    if (currentQuestion == 0) {
        await sleep(1000);  // Sleep for 2 seconds
    }
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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