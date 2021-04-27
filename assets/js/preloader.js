window.addEventListener("load", () => {
    // Document fully loaded -> fade-out preloader - https://stackoverflow.com/a/29017547
    let fadeTarget = document.getElementById("loader-wrapper");
    let fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 10);
});