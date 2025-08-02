const lang = window.location.pathname.includes("/pt") ? "pt" : "en";

function getContentUrl(lang){
    if(lang == "pt") return "https://content.now-ly.com/lasthour-pt.txt"
    else return "https://content.now-ly.com/lasthour-en.txt"
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
    processSources();
  })
  .catch(err => {
    document.getElementById("content").textContent = strings[lang].error;
    console.error(err);
  });

function processSources() {
  const contentDiv = document.getElementById("content");
  const children = Array.from(contentDiv.children);

  let currentH2Wrapper = null;
  let sectionLinks = [];

  const createSourceContainer = (links, targetWrapper) => {
    if (links.length === 0) return;

    const sourceIndicatorContainer = document.createElement("div");
    sourceIndicatorContainer.classList.add("source-indicator-container");

    links.forEach(linkData => {
      const sourceItem = document.createElement("div");
      sourceItem.classList.add("source-item");

      const faviconImg = document.createElement("img");
      faviconImg.classList.add("source-favicon");
      faviconImg.src = `https://www.google.com/s2/favicons?domain=${new URL(linkData.href).hostname}`;
      faviconImg.alt = `Favicon for ${new URL(linkData.href).hostname}`;

      const sourcePopup = document.createElement("div");
      sourcePopup.classList.add("source-popup");
      sourcePopup.innerHTML = `<a href="${linkData.href}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;

      sourceItem.appendChild(faviconImg);
      sourceItem.appendChild(sourcePopup);
      sourceIndicatorContainer.appendChild(sourceItem);

      sourceItem.addEventListener("click", () => {
        window.open(linkData.href, "_blank");
      });
    });

    targetWrapper.appendChild(sourceIndicatorContainer);
  };

  children.forEach(child => {
    if (child.tagName === "H2") {
      if (currentH2Wrapper && sectionLinks.length > 0) {
        createSourceContainer(sectionLinks, currentH2Wrapper);
      }
      const h2Wrapper = document.createElement("div");
      h2Wrapper.classList.add("h2-section-wrapper");
      child.parentNode.insertBefore(h2Wrapper, child);
      h2Wrapper.appendChild(child);
      currentH2Wrapper = h2Wrapper;
      sectionLinks = [];
    } else if (child.tagName === "P") {
      const links = child.querySelectorAll("a");
      if (links.length > 0) {
        links.forEach(link => {
          sectionLinks.push({ href: link.href, text: link.textContent });
        });
        child.remove(); // Remove the paragraph if it contained links
      }
    }
  });

  if (sectionLinks.length > 0) {
    if (currentH2Wrapper) {
      createSourceContainer(sectionLinks, currentH2Wrapper);
    } else {
      const h2Wrapper = document.createElement("div");
      h2Wrapper.classList.add("h2-section-wrapper");
      contentDiv.prepend(h2Wrapper);
      createSourceContainer(sectionLinks, h2Wrapper);
    }
  }
}

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
