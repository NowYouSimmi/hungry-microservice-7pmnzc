import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css"; // or App.css, depending on what you actually use

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
