import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemedApp } from "./ThemedApp.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = localStorage.getItem("theme");

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemedApp mode={theme} />
    </QueryClientProvider>
  </React.StrictMode>
);
