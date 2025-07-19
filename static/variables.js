// Utility and configuration module

export const loadingTexts = [
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

export const wishLines = [
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

export const specialDay = "2024-07-21T12:00:00";

export const getRandomLoadingText = () =>
    loadingTexts[Math.floor(Math.random() * loadingTexts.length)];

export const getRandomWishLine = () =>
    wishLines[Math.floor(Math.random() * wishLines.length)];

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