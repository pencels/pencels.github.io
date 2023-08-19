import { useEffect, useState } from "react";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";
import { Button, DarkThemeToggle, useThemeMode } from "flowbite-react";

import "./App.css";

function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function chooseOne<T>(items: T[]): T {
  const i = randomInt(0, items.length);
  return items[i];
}

type Config = {
  adjectives: string[];
  nouns: string[];
};

function generateName(config: Config): string {
  const adjs = [...adjectives, ...config.adjectives];
  const nouns = [...animals, ...config.nouns];

  const word = uniqueNamesGenerator({
    dictionaries: [adjs, nouns],
    style: "capital",
    separator: "",
  });
  const num = randomInt(1, 100);
  return word + num;
}

function generateNames(num: number, opts: Config): string[] {
  const names = [];
  for (let i = 0; i < num; i++) {
    names.push(generateName(opts));
  }
  return names;
}

function App() {
  const opts = { adjectives: [], nouns: [] };
  const [num, setNum] = useState(5);
  const [names, setNames] = useState(generateNames(num - 1, opts));
  const [copied, setCopied] = useState<number | undefined>();
  const [realNames, setRealNames] = useState([] as string[]);
  const [realName, setRealName] = useState("N/A");

  useEffect(() => {
    setRealName(chooseOne(realNames));
  }, [realNames]);

  const [mode, _, toggleMode] = useThemeMode();

  useEffect(() => {
    async function fetchNames() {
      const text = await fetch("./console-names.txt").then((res) => res.text());
      setRealNames(text.trim().split("\n"));
    }
    fetchNames();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  useEffect(() => {
    const id = setTimeout(() => {
      setCopied(undefined);
    }, 3000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="h-screen p-3 flex flex-col gap-3 bg-lime-100 dark:bg-lime-950 text-lime-900 dark:text-lime-100 text-xl">
      <div className="flex">
        <span className="text-3xl">Console Names</span>
        <DarkThemeToggle
          id="dark-theme-toggle"
          className="ml-auto"
          onClick={() => {
            toggleMode?.();
          }}
        />
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <div>Names: {num}</div>
        <input
          type="range"
          className="grow bg-lime-300 rounded-lg cursor-pointer dark:bg-lime-700 h-2 range-sm accent-lime-700 slider"
          min="3"
          max="15"
          value={num}
          onChange={(e) => setNum(e.target.valueAsNumber)}
        />
        <Button
          className="bg-lime-700 dark:bg-lime-700 text-lime-100 focus:ring-lime-300 enabled:hover:bg-lime-800 dark:enabled:hover:bg-lime-700 dark:focus:ring-lime-800"
          onClick={() => {
            setRealName(chooseOne(realNames));
            setNames(generateNames(num - 1, opts));
          }}
        >
          Generate
        </Button>
      </div>
      <div className="flex flex-col gap-1 grow overflow-y-auto text-5xl">
        <div className="flex gap-1">
          <div className="real-names text-xs rotate-180">Real Name!</div>
          <div
            className="flex w-full gap-2 p-2 rounded cursor-pointer bg-yellow-300/50 dark:bg-yellow-400/30 hover:bg-yellow-300/70 dark:hover:bg-yellow-400/50 text-left items-center"
            onClick={async () => {
              await navigator.clipboard.writeText(realName);
              setCopied(-1);
            }}
            onMouseOut={() => {
              setCopied(undefined);
            }}
          >
            <svg
              className="w-6 h-6 text-yellow-400/90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
            <span className="break-words">{realName}</span>
            <span className="copy-text text-sm rounded p-1 bg-lime-900/20 dark:bg-lime-100/10 select-none">
              {-1 === copied ? "Copied!" : "Copy"}
            </span>
          </div>
        </div>
        {names.map((name, i) => (
          <div
            key={i}
            className="flex gap-2 p-2 rounded cursor-pointer hover:bg-lime-500/20 dark:hover:bg-lime-100/20 text-left items-center"
            onClick={async () => {
              await navigator.clipboard.writeText(name);
              setCopied(i);
            }}
            onMouseOut={() => {
              setCopied(undefined);
            }}
          >
            <span className="break-words">{name}</span>
            <span className="copy-text text-sm rounded p-1 bg-lime-900/20 dark:bg-lime-100/10 select-none">
              {i === copied ? "Copied!" : "Copy"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
