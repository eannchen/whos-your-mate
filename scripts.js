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
        document.getElementById('landing-page').classList.add('d-none');
        document.getElementById('game-page').classList.remove('d-none');

        const gameData = await fetchGameData();
        loadQuestion(gameData, 0);
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
        // Add cake emoji animation
    } else {
        gameTitle.textContent = 'Oops! 💩';
        document.getElementById('message').classList.add('d-none');
        document.getElementById('group-photo').classList.add('d-none');
        // Add poo emoji animation
    }
}


function backToStart() {
    document.getElementById('game-title').textContent = 'Who is your boyfriend?';
    document.getElementById('end-page').classList.add('d-none');
    document.getElementById('landing-page').classList.remove('d-none');
}