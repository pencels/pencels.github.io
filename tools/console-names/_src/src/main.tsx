import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemedApp } from "./ThemedApp.tsx";

const theme = localStorage.getItem("theme");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemedApp mode={theme} />
  </React.StrictMode>
);
