export function loadIcons() {
  if (document.getElementById("tabler-icons")) return;
  const link = document.createElement("link");
  link.id = "tabler-icons";
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.11.0/dist/tabler-icons.min.css";
  document.head.appendChild(link);
}
