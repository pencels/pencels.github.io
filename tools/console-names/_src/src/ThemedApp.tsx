import App from "./App.tsx";
import { Flowbite } from "flowbite-react";

export function ThemedApp({ mode }: { mode: string | null }) {
  return (
    <Flowbite theme={{ dark: mode === "dark" }}>
      <App />
    </Flowbite>
  );
}
