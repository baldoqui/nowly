const lang = window.location.pathname.includes("/pt") ? "pt" : "en";

function getContentUrl(lang){
    if(lang == "pt") return "https://pub-cbb53e25b97244bbb81044420fb53b8d.r2.dev/lasthour-pt.txt"
    else return "https://pub-cbb53e25b97244bbb81044420fb53b8d.r2.dev/lasthour-en.txt"
}

const strings = {
  pt: {
    loading: "Carregando...",
    error: "Erro ao carregar conteúdo."
  },
  en: {
    loading: "Loading...",
    error: "Failed to load content."
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
