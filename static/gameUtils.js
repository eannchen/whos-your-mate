// Utility and configuration module
import { loadConfig } from './configLoader.js';

let config;

export const initGameUtils = async () => {
    config = await loadConfig();
};

export const getRandomWishLine = () =>
    config.WISH_LINES[Math.floor(Math.random() * config.WISH_LINES.length)];

export const getRandomLoadingText = () =>
    config.LOADING_TEXTS[Math.floor(Math.random() * config.LOADING_TEXTS.length)];

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export let query = "?auth=";
export const setQuery = password => { query = "?auth=" + password; };

export const fetchGameData = async () => {
    const response = await fetch('/game-data' + query);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
};

export const preloadImages = gameData => {
    const preloadContainer = document.getElementById('preload-images');
    gameData.questions.forEach(q => {
        ['img1', 'img2'].forEach(imgKey => {
            const img = document.createElement('img');
            img.src = q[imgKey] + query;
            preloadContainer.appendChild(img);
        });
    });
    const endingPhoto = document.createElement('img');
    endingPhoto.src = gameData.endingPhoto + query;
    preloadContainer.appendChild(endingPhoto);
};

export const startConfettiAnimation = () => {
    const duration = 1200;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
};

export const startHeartAnimation = () => {
    const container = document.getElementById('animation');
    container.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = `${i * 10}%`;
        heart.style.animationDuration = `${Math.random() * 2 + 4}s`;
        const isBlack = Math.random() < 0.5;
        heart.style.backgroundColor = isBlack ? 'black' : 'white';
        heart.style.opacity = isBlack ? '0.7' : '0.8';
        container.appendChild(heart);
    }
};