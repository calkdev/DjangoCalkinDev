import "./styles/login.scss";

// Sync theme from main site
const saved = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);
