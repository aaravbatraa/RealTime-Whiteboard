const themes = {
  light: { "--bg": "#ffffff", "--fg": "#212529", "--accent": "#0d6efd" },
  dark:  { "--bg": "#212529", "--fg": "#f8f9fa", "--accent": "#0d6efd" },
  sepia: { "--bg": "#f8f4e3", "--fg": "#5c4033", "--accent": "#d4a373" },
};

export function applyThemeVars(name) {
  const root = document.documentElement;
  Object.entries(themes[name] || themes.light).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

export function setupTheme(ydoc) {
  const prefs = ydoc.getMap("prefs");

  const savedTheme = localStorage.getItem("theme") || "light";
  applyThemeVars(savedTheme);
  prefs.set("theme", savedTheme);

  prefs.observe((event) => {
    if (event.keysChanged.has("theme")) {
      const name = prefs.get("theme");
      applyThemeVars(name);
      localStorage.setItem("theme", name);
    }
  });

  return {
    setTheme: (name) => prefs.set("theme", name),
  };
}