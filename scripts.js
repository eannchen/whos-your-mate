// scripts.js

const APIUrl = 'http://127.0.0.1:8080'

document.addEventListener('DOMContentLoaded', () => {
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
    const birthday = new Date('2024-07-10'); // Replace with the actual birthday
    const today = new Date();
    const countdownElement = document.getElementById('countdown');
    const startGameButton = document.getElementById('start-game');

    if (today < birthday) {
        const daysLeft = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
        countdownElement.textContent = `${daysLeft} days until her birthday!`;
        startGameButton.style.display = 'none';
    } else {
        countdownElement.style.display = 'none';
        startGameButton.style.display = 'block';
    }
}

async function startGame() {
    try {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';

        const gameData = await fetchGameData();
        loadQuestion(gameData, 0);
    } catch (error) {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('game-page').style.display = 'none';
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


function endGame(gameData, won) {
    document.getElementById('game-page').style.display = 'none';
    document.getElementById('end-page').style.display = 'block';
    if (won) {
        document.getElementById('message').textContent = 'Happy Birthday! 🎂';
        document.getElementById('group-photo').src = gameData.groupPhoto;
        // Add cake emoji animation
    } else {
        document.getElementById('message').textContent = 'Oops! 💩';
        // Add poo emoji animation
    }
}