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

// Filters the article list on the home page, keeping the selection in the URL.
const filterForm = document.querySelector("form.filters");

if (filterForm) {
  const articles = [...document.querySelectorAll(".article-item")];
  const noMatch = document.querySelector(".no-match");

  const applyFilters = () => {
    const filters = new FormData(filterForm);
    let shown = 0;

    for (const article of articles) {
      const match = ["sourceLanguage", "country"].every((name) => {
        const value = filters.get(name);
        return !value || article.dataset[name] === value;
      });
      article.hidden = !match;
      if (match) shown++;
    }

    noMatch.hidden = shown > 0;
    const query = new URLSearchParams([...filters].filter(([, value]) => value)).toString();
    history.replaceState(null, "", query ? `?${query}` : location.pathname);
  };

  const params = new URLSearchParams(location.search);
  for (const select of filterForm.querySelectorAll("select")) {
    select.value = params.get(select.name) ?? "";
    select.addEventListener("change", applyFilters);
  }
  filterForm.querySelector("button").hidden = true;
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  applyFilters();
}
