const loadingTexts = [
    "Hold tight, magic is happening!",
    "Getting things ready just for you...",
    "Almost there, stay tuned!",
    "Fetching some awesomeness...",
    "The best things come to those who wait!",
    "Making sure everything is perfect...",
    "Good things take time, almost done!",
    "Hold on, sprinkling some magic dust...",
    "Patience is a virtue, loading...",
    "Getting things ready for you, hang tight!"
];

function getRandomLoadingText() {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
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

function getRandomWishLine() {
    return wishLines[Math.floor(Math.random() * wishLines.length)];
}

const specialDay = "2024-07-10T12:00:00"

let query = "?auth=";

function setQuery(password) {
    query = "?auth=" + password
}

let eleTitle;

let elePageLoadingOverlay;
let elePageLoadingOverlayText;

let elePageLoading;
let elePageLoadingCountdown;
let elePageLoadingAnimation;
let elePageLoadingStartGame;
let elePageLoadingPassword;
let elePageLoadingPasswordErrMsg;
let elePageLoadingPasswordInput;

let elePageGame;
let elePageGameOption1;
let elePageGameOption2;

let elePageEnd;
let elePageEndMessage;
let elePageEndGroupPhoto;

function getElements() {
    // Game page
    eleTitle = document.getElementById('game-title');

    // Loading Overlay
    elePageLoadingOverlay = document.getElementById('loading-overlay');
    elePageLoadingOverlayText = document.getElementById('loading-text');

    // Loading page
    elePageLoading = document.getElementById('landing-page');
    elePageLoadingCountdown = document.getElementById('countdown');
    elePageLoadingAnimation = document.getElementById('animation');
    elePageLoadingStartGame = document.getElementById('start-game');
    elePageLoadingPassword = document.getElementById('password');
    elePageLoadingPasswordErrMsg = document.getElementById('error-message');
    elePageLoadingPasswordInput = document.getElementById('password-input');

    // Game page
    elePageGame = document.getElementById('game-page');
    elePageGameOption1 = document.getElementById('option1');
    elePageGameOption2 = document.getElementById('option2');

    // End page
    elePageEnd = document.getElementById('end-page');
    elePageEndMessage = document.getElementById('message');
    elePageEndGroupPhoto = document.getElementById('group-photo');
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGameData() {
    const response = await fetch('/game-data' + query);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const gameData = await response.json();
    return gameData;
}

function preloadImages(gameData) {
    const preloadContainer = document.getElementById('preload-images');
    gameData.questions.forEach(question => {
        const img1 = document.createElement('img');
        const img2 = document.createElement('img');
        img1.src = question.img1 + query;
        img2.src = question.img2 + query;
        preloadContainer.appendChild(img1);
        preloadContainer.appendChild(img2);
    });
    const groupPhoto = document.createElement('img');
    groupPhoto.src = gameData.groupPhoto + query;
    preloadContainer.appendChild(groupPhoto);
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
    elePageLoadingAnimation.innerHTML = ''; // Clear previous hearts
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = `${i * 10}%`; // Ensure hearts are centered
        heart.style.animationDuration = `${Math.random() * 2 + 4}s`;
        const isBlack = Math.random() < 0.5;
        heart.style.backgroundColor = isBlack ? 'black' : 'white'; // Randomly assign black or white color
        heart.style.opacity = isBlack ? '0.7' : '0.8'; // Set opacity based on color
        elePageLoadingAnimation.appendChild(heart);
    }
}