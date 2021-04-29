// USer Preference for theme
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
const themeSwitcher = document.getElementsByClassName('dark--toggle')[0];
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}
// Switch theme
function setSwitchTheme() {
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }    
}
themeSwitcher.addEventListener('click', setSwitchTheme, false);