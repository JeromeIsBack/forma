import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { loadIcons } from "./lib/icons.js";
import "./index.css";

loadIcons();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
