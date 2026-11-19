const lang = window.location.pathname.includes("/pt") ? "pt" : "en";

const strings = {
  pt: {
    play: "Tocar",
    pause: "Pausar",
    toggleTheme: "Alternar tema"
  },
  en: {
    play: "Play",
    pause: "Pause",
    toggleTheme: "Toggle theme"
  }
};

// Handle source item clicks (rendered server-side)
document.addEventListener('click', (event) => {
  const target = event.target;
  const sourceItem = target.closest('.source-item');
  if (sourceItem) {
    const href = sourceItem.getAttribute('data-href');
    if (href) {
      window.open(href, '_blank');
    }
  }
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
