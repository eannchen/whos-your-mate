// Main app logic

import {
    specialDay, getRandomLoadingText, getRandomWishLine, setQuery, query,
    fetchGameData, preloadImages, sleep, startConfettiAnimation, startHeartAnimation
} from './variables.js';

const App = {
    elements: {},
    countdownInterval: null,

    init() {
        this.cacheElements();
        this.bindEvents();
        this.startCountdown();
        startHeartAnimation();
    },

    cacheElements() {
        this.elements = {
            title: document.getElementById('game-title'),
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingOverlayText: document.getElementById('loading-text'),
            loading: document.getElementById('landing-page'),
            countdown: document.getElementById('countdown'),
            animation: document.getElementById('animation'),
            startGame: document.getElementById('start-game'),
            password: document.getElementById('password'),
            passwordErrMsg: document.getElementById('error-message'),
            passwordInput: document.getElementById('password-input'),
            game: document.getElementById('game-page'),
            option1: document.getElementById('option1'),
            option2: document.getElementById('option2'),
            end: document.getElementById('end-page'),
            endMessage: document.getElementById('message'),
            endGroupPhoto: document.getElementById('group-photo')
        };
    },

    bindEvents() {
        this.elements.startGame.querySelector('button').addEventListener('click', () => this.showPasswordInput());
        this.elements.password.querySelector('button').addEventListener('click', () => this.setPassword());
        document.getElementById('back-to-start').addEventListener('click', () => this.pageEnd2PageLoading());
    },

    startCountdown() {
        const update = () => {
            const timeLeft = new Date(specialDay) - new Date();
            if (timeLeft <= 0) {
                this.elements.countdown.classList.add('d-none');
                this.elements.startGame.classList.remove('d-none');
                clearInterval(this.countdownInterval);
            } else {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                this.elements.countdown.textContent =
                    `Only ${days}d, ${hours}h, ${minutes}m, and ${seconds}s until Sonnie's special day!`;
            }
        };
        this.countdownInterval = setInterval(update, 1000);
        update();
    },

    showLoadingPage() {
        this.elements.loadingOverlayText.textContent = getRandomLoadingText();
        this.elements.loadingOverlay.classList.remove('d-none');
    },

    hideLoadingPage() {
        this.elements.loadingOverlay.classList.add('d-none');
    },

    showPasswordInput() {
        this.elements.passwordErrMsg.textContent = '';
        this.elements.password.classList.remove('d-none');
        this.elements.startGame.classList.add('d-none');
    },

    rollbackShowPasswordInput() {
        this.elements.password.classList.add('d-none');
        this.elements.startGame.classList.remove('d-none');
    },

    pageLoading2PageGame() {
        this.elements.loading.classList.add('d-none');
        this.elements.game.classList.remove('d-none');
    },

    async setPassword() {
        setQuery(this.elements.passwordInput.value);
        try {
            this.showLoadingPage();
            const gameData = await fetchGameData();
            preloadImages(gameData);
            this.loadQuestion(gameData, 0);
            await sleep(1000);
            this.hideLoadingPage();
            this.rollbackShowPasswordInput();
            this.pageLoading2PageGame();
        } catch (error) {
            this.hideLoadingPage();
            this.elements.passwordErrMsg.textContent = 'Error loading game data. The password might be wrong!';
        }
    },

    loadQuestion(gameData, currentQuestion) {
        if (currentQuestion < gameData.questions.length) {
            const question = gameData.questions[currentQuestion];
            this.elements.option1.src = question.img1 + query;
            this.elements.option2.src = question.img2 + query;
            this.elements.option1.onclick = () => this.checkAnswer(gameData, currentQuestion, 1);
            this.elements.option2.onclick = () => this.checkAnswer(gameData, currentQuestion, 2);
        } else {
            this.endGame(gameData, true);
        }
    },

    checkAnswer(gameData, currentQuestion, selectedOption) {
        const correctOption = gameData.questions[currentQuestion].correct;
        if (selectedOption === correctOption) {
            this.loadQuestion(gameData, currentQuestion + 1);
        } else {
            this.endGame(gameData, false);
        }
    },

    pageGame2PageEnd() {
        this.elements.game.classList.add('d-none');
        this.elements.end.classList.remove('d-none');
        this.elements.option1.removeAttribute("src");
        this.elements.option2.removeAttribute("src");
    },

    endGame(gameData, won) {
        if (won) {
            this.elements.title.textContent = 'Happy Birthday 🎂';
            this.elements.endMessage.textContent = getRandomWishLine();
            this.elements.endMessage.classList.remove('d-none');
            this.elements.endGroupPhoto.src = gameData.groupPhoto + query;
            this.elements.endGroupPhoto.classList.remove('d-none');
            startConfettiAnimation();
        } else {
            this.elements.title.textContent = 'Oops! 💩';
            this.elements.endMessage.classList.add('d-none');
            this.elements.endGroupPhoto.classList.add('d-none');
        }
        this.pageGame2PageEnd();
    },

    pageEnd2PageLoading() {
        this.elements.title.textContent = "Who's your mate?";
        this.elements.end.classList.add('d-none');
        this.elements.loading.classList.remove('d-none');
    }
};

window.App = App; // For access in HTML onclicks

document.addEventListener('DOMContentLoaded', () => App.init());