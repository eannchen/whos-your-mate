document.addEventListener('DOMContentLoaded', () => {
    getElements();
    checkBirthday();
    startHeartAnimation();
});

function checkBirthday() {
    let countdownInterval;
    const updateCountdown = function () {
        const timeLeft = new Date(specialDay) - new Date();
        if (timeLeft <= 0) {
            elePageLoadingCountdown.classList.add('d-none');
            elePageLoadingStartGame.classList.remove('d-none');
            clearInterval(countdownInterval); // Stop the interval when the countdown ends
        } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            elePageLoadingCountdown.textContent = `Only ${days}d, ${hours}h, ${minutes}m, and ${seconds}s until Sonnie's special day!`;
        }
    }
    countdownInterval = setInterval(updateCountdown, 1000); // Update the countdown every second
    updateCountdown();
}

function showLoadingPage() {
    elePageLoadingOverlayText.textContent = getRandomLoadingText();
    elePageLoadingOverlay.classList.remove('d-none');
}

function hideLoadingPage() {
    elePageLoadingOverlay.classList.add('d-none');
}

function ShowPasswordInput() {
    elePageLoadingPasswordErrMsg.textContent = '';
    elePageLoadingPassword.classList.remove('d-none');
    elePageLoadingStartGame.classList.add('d-none');
}

function rollbackShowPasswordInput() {
    elePageLoadingPassword.classList.add('d-none');
    elePageLoadingStartGame.classList.remove('d-none');
}

function pageLoading2PageGame() {
    elePageLoading.classList.add('d-none');
    elePageGame.classList.remove('d-none');
}

async function SetPassword() {
    setQuery(elePageLoadingPasswordInput.value);
    // Start game
    try {
        showLoadingPage();
        const gameData = await fetchGameData();
        preloadImages(gameData);
        loadQuestion(gameData, 0);
        await sleep(1000);
        hideLoadingPage();

        rollbackShowPasswordInput();
        pageLoading2PageGame();
    } catch (error) {
        hideLoadingPage();
        elePageLoadingPasswordErrMsg.textContent = 'Error loading game data. The password might be wrong!';
    }
}

function loadQuestion(gameData, currentQuestion) {
    if (currentQuestion < gameData.questions.length) {
        const question = gameData.questions[currentQuestion];
        elePageGameOption1.src = question.img1 + query;
        elePageGameOption2.src = question.img2 + query;
        elePageGameOption1.onclick = () => checkAnswer(gameData, currentQuestion, 1);
        elePageGameOption2.onclick = () => checkAnswer(gameData, currentQuestion, 2);
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

function pageGame2PageEnd() {
    elePageGame.classList.add('d-none');
    elePageEnd.classList.remove('d-none');
    // clean up paths
    elePageGameOption1.removeAttribute("src");
    elePageGameOption2.removeAttribute("src");
}

function endGame(gameData, won) {
    if (won) {
        eleTitle.textContent = 'Happy Birthday 🎂';
        elePageEndMessage.textContent = getRandomWishLine();
        elePageEndMessage.classList.remove('d-none');
        elePageEndGroupPhoto.src = gameData.groupPhoto + query;
        elePageEndGroupPhoto.classList.remove('d-none');
        startConfettiAnimation();
    } else {
        eleTitle.textContent = 'Oops! 💩';
        elePageEndMessage.classList.add('d-none');
        elePageEndGroupPhoto.classList.add('d-none');
    }
    pageGame2PageEnd();
}


function PageEnd2PageLoading() {
    eleTitle.textContent = "Who's your boyfriend?";
    elePageEnd.classList.add('d-none');
    elePageLoading.classList.remove('d-none');
}
