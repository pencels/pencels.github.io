import App from "./App.tsx";
import { ThemeConfig } from "flowbite-react";

export function ThemedApp({ mode }: { mode: string | null }) {
  return (
    <>
      <ThemeConfig {...{ dark: mode === "dark" }} />
      <App />
    </>
  );
}
