// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    checkBirthday();
});

async function fetchGameData() {
    const response = await fetch('http://127.0.0.1:8080/game-data');
    const questions = await response.json();
    return questions;
}

function checkBirthday() {
    const birthday = new Date('2024-07-07'); // Replace with the actual birthday
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
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    const questions = await fetchGameData();
    loadQuestion(questions, 0);
}


function loadQuestion(questions, currentQuestion) {
    if (currentQuestion < questions.length) {
        const question = questions[currentQuestion];
        document.getElementById('option1').src = question.img1;
        document.getElementById('option2').src = question.img2;
        document.getElementById('option1').onclick = () => checkAnswer(questions, currentQuestion, 1);
        document.getElementById('option2').onclick = () => checkAnswer(questions, currentQuestion, 2);
    } else {
        endGame(true);
    }
}

function checkAnswer(questions, currentQuestion, selectedOption) {
    const correctOption = questions[currentQuestion].correct;
    if (selectedOption === correctOption) {
        loadQuestion(questions, currentQuestion + 1);
    } else {
        endGame(false);
    }
}


function endGame(won) {
    document.getElementById('game-page').style.display = 'none';
    document.getElementById('end-page').style.display = 'block';
    if (won) {
        document.getElementById('message').textContent = 'Happy Birthday! 🎂';
        document.getElementById('group-photo').src = '/images/group-photo.jpg'; // Replace with actual random selection
        // Add cake emoji animation
    } else {
        document.getElementById('message').textContent = 'Oops! 💩';
        // Add poo emoji animation
    }
}