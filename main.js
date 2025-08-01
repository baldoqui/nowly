const lang = window.location.pathname.includes("/pt") ? "pt" : "en";

function getContentUrl(lang){
    if(lang == "pt") return "https://pub-cbb53e25b97244bbb81044420fb53b8d.r2.dev/lasthour-pt.txt"
    else return "https://pub-cbb53e25b97244bbb81044420fb53b8d.r2.dev/lasthour-en.txt"
}

const strings = {
  pt: {
    loading: "Carregando...",
    error: "Erro ao carregar conteúdo.",
    play: "Tocar",
    pause: "Pausar",
    toggleTheme: "Alternar tema"
  },
  en: {
    loading: "Loading...",
    error: "Failed to load content.",
    play: "Play",
    pause: "Pause",
    toggleTheme: "Toggle theme"
  }
};

document.getElementById("content").textContent = strings[lang].loading;

fetch(getContentUrl(lang))
  .then(res => res.text())
  .then(md => {
    document.getElementById("content").innerHTML = marked.parse(md);
  })
  .catch(err => {
    document.getElementById("content").textContent = strings[lang].error;
    console.error(err);
  });

const themeToggle = document.getElementById("theme-toggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.setAttribute("aria-label", strings[lang].toggleTheme);
  if (theme === "dark") {
    themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  } else {
    themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
});

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");
setTheme(defaultTheme);

const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause-btn");
const progressBar = document.getElementById("progress-bar");
const playbackSpeedBtn = document.getElementById("playback-speed-btn");

function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="bi bi-pause-circle-fill"></i>';
    playPauseBtn.setAttribute("aria-label", strings[lang].pause);
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="bi bi-play-circle-fill"></i>';
    playPauseBtn.setAttribute("aria-label", strings[lang].play);
  }
}

playPauseBtn.addEventListener("click", togglePlayPause);

audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
});

progressBar.addEventListener("input", () => {
  const time = (progressBar.value / 100) * audio.duration;
  audio.currentTime = time;
});

const playbackSpeeds = [1, 1.5, 2, 0.5];
let currentSpeedIndex = 0;

playbackSpeedBtn.addEventListener("click", () => {
  currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
  const newSpeed = playbackSpeeds[currentSpeedIndex];
  audio.playbackRate = newSpeed;
  playbackSpeedBtn.textContent = `${newSpeed}x`;
});

playPauseBtn.innerHTML = '<i class="bi bi-play-circle-fill"></i>';
