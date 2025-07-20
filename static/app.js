// Main app logic
import { loadConfig } from './configLoader.js';
import {
    initGameUtils,
    getRandomLoadingText, getRandomWishLine,
    setQuery, query,
    fetchGameData, preloadImages, sleep,
    startConfettiAnimation, startHeartAnimation
} from './gameUtils.js';


const App = {
    elements: {},
    countdownInterval: null,

    async init() {
        this.config = await loadConfig();
        await initGameUtils();

        this.cacheElements();
        this.bindEvents();
        this.initTheme();
        this.startCountdown();
        startHeartAnimation();
    },

    cacheElements() {
        this.elements = {
            title: document.getElementById('game-title'),
            madeBy: document.getElementById('made-by'),
            // Loading Overlay
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingOverlayText: document.getElementById('loading-text'),
            // Theme Toggle
            themeLightBtn: document.getElementById('theme-light'),
            themeDarkBtn: document.getElementById('theme-dark'),
            // Home Page
            homePage: document.getElementById('home-page'),
            countdown: document.getElementById('countdown'),
            animation: document.getElementById('animation'),
            startGame: document.getElementById('start-game'),
            password: document.getElementById('password'),
            passwordErrMsg: document.getElementById('error-message'),
            passwordInput: document.getElementById('password-input'),
            // Game Page
            gamePage: document.getElementById('game-page'),
            option1: document.getElementById('option1'),
            option2: document.getElementById('option2'),
            // End Page
            endPage: document.getElementById('end-page'),
            endMessage: document.getElementById('message'),
            endGroupPhoto: document.getElementById('group-photo'),
            backToStartBtn: document.getElementById('back-to-start')
        };
    },

    bindEvents() {
        // Theme Toggle
        this.elements.themeDarkBtn.addEventListener('click', () => this.setThemeDark());
        this.elements.themeLightBtn.addEventListener('click', () => this.setThemeLight());
        // Home Page
        this.elements.startGame.querySelector('button').addEventListener('click', () => this.showPasswordInput());
        this.elements.password.querySelector('button').addEventListener('click', () => this.setPassword());
        // End Page
        this.elements.backToStartBtn.addEventListener('click', () => this.pageEnd2PageHome());
    },

    setThemeDark() {
        document.body.classList.add('theme-dark');
        this.elements.themeDarkBtn.classList.add('active');
        this.elements.themeLightBtn.classList.remove('active');
        this.elements.madeBy.textContent = `Made with 🤍 by ${this.config.MADE_BY}`;
        localStorage.setItem('theme', 'dark');
    },

    setThemeLight() {
        document.body.classList.remove('theme-dark');
        this.elements.themeLightBtn.classList.add('active');
        this.elements.themeDarkBtn.classList.remove('active');
        this.elements.madeBy.textContent = `Made with 💖 by ${this.config.MADE_BY}`;
        localStorage.setItem('theme', 'light');
    },

    initTheme() {
        this.elements.title.textContent = this.config.APP_TITLE;

        if (localStorage.getItem('theme') === 'dark') {
            this.setThemeDark();
        } else {
            this.setThemeLight();
        }
    },

    startCountdown() {
        const update = () => {
            const timeLeft = new Date(this.config.SPECIAL_DAY) - new Date();
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
                    `Only ${days}d, ${hours}h, ${minutes}m, and ${seconds}s until ${this.config.SPECIAL_PERSON}'s special day!`;
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

    pageLoading2PageHome() {
        this.elements.homePage.classList.add('d-none');
        this.elements.gamePage.classList.remove('d-none');
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
            this.pageLoading2PageHome();
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
        this.elements.gamePage.classList.add('d-none');
        this.elements.endPage.classList.remove('d-none');
        this.elements.option1.removeAttribute("src");
        this.elements.option2.removeAttribute("src");
    },

    endGame(gameData, won) {
        if (won) {
            this.elements.title.textContent = 'Happy Birthday 🎂';
            this.elements.endMessage.textContent = getRandomWishLine();
            this.elements.endMessage.classList.remove('d-none');
            this.elements.endGroupPhoto.src = gameData.endingPhoto + query;
            this.elements.endGroupPhoto.classList.remove('d-none');
            startConfettiAnimation();
        } else {
            this.elements.title.textContent = 'Oops! 💩';
            this.elements.endMessage.classList.add('d-none');
            this.elements.endGroupPhoto.classList.add('d-none');
        }
        this.pageGame2PageEnd();
    },

    pageEnd2PageHome() {
        this.elements.title.textContent = this.config.APP_TITLE;
        this.elements.endPage.classList.add('d-none');
        this.elements.homePage.classList.remove('d-none');
    }
};

window.App = App; // For access in HTML onclicks

document.addEventListener('DOMContentLoaded', () => App.init());