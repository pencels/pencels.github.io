import { ThemeConfig, TextInput, Toast } from "flowbite-react";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { addName, db } from "./db";
import { useState } from "react";
import { Button } from "./components/Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { cssTransition, toast, ToastContainer } from "react-toastify";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";

function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
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

function generateNames(num: number, opts?: Config): string[] {
  const names = [];
  for (let i = 0; i < num; i++) {
    names.push(generateName(opts || { nouns: [], adjectives: [] }));
  }
  return names;
}

export function ThemedApp({ mode }: { mode: string | null }) {
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");

  const { data } = useInfiniteQuery({
    queryKey: ["console-names"],
    queryFn: async ({ pageParam }) => {
      const pageQuery = query(
        collection(db, "console-names"),
        orderBy("discovered"),
        startAfter(pageParam),
        limit(10)
      );
      const snap = await getDocs(pageQuery);
      return snap.docs;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage[lastPage.length - 1].get("discovered"),
  });
  const names = data?.pages
    .flatMap((page) => page.flatMap((doc) => doc.get("name") as string))
    .filter((n) => n.startsWith(inputName));

  return (
    <>
      <ThemeConfig {...{ dark: mode === "dark" }} />
      <div className="@container dark:bg-zinc-900 dark:text-white w-full px-3 py-2 font-light h-screen">
        <ToastContainer
          transition={cssTransition({
            enter: "animate-fade opacity-1",
            exit: "animate-fade-out opacity-0",
          })}
          autoClose={1200}
          closeButton={false}
          hideProgressBar={true}
          draggable={false}
          className="p-0 m-0"
        />
        <div className="sm:w-lg md:w-lg lg:w-xl mx-auto flex flex-col h-full">
          <h1 className="text-4xl dark:text-white mb-2 mt-3">Console Names</h1>
          <div>
            Generate some fake console names, or search for / submit real-life
            console names!
          </div>
          <div className="mt-3">
            <Button onClick={() => setGeneratedNames(generateNames(5))}>
              Generate
            </Button>
            <div className="flex flex-col">
              {generatedNames.map((name) => (
                <button
                  key={name}
                  className="border-gray-200 dark:border-gray-700 border-1 px-3 py-1 mt-2 hover:border-red-600 dark:hover:border-red-600 flex justify-between items-center cursor-pointer"
                  onClick={async () => {
                    await navigator.clipboard.writeText(name);
                    toast(
                      () => (
                        <Toast
                          theme={{
                            root: {
                              base: "rounded-none! dark:text-white! dark:bg-zinc-900! font-light! border-1 border-black dark:border-white",
                            },
                          }}
                        >
                          Copied to clipboard!
                        </Toast>
                      ),
                      {
                        toastId: name,
                      }
                    );
                  }}
                >
                  {name}
                  <Square2StackIcon height={16} className="cursor-pointer" />
                </button>
              ))}
            </div>
          </div>
          <div className="text-center font-medium my-3">OR</div>
          <TextInput
            theme={{
              field: {
                input: {
                  base: "dark:bg-zinc-800! rounded-none! focus:border-red-600! focus:ring-red-600!",
                },
              },
            }}
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Begin typing a name..."
          />
          {names?.length === 0 ? (
            <div className="text-center w-3/4 m-auto my-3">
              Could not find any names that match this one. Would you like to
              submit it as a new name?
              <Button
                onClick={async () => {
                  await addName(inputName);
                  setInputName("");
                  toast(
                    () => (
                      <Toast
                        theme={{
                          root: {
                            base: "rounded-none! dark:text-white! dark:bg-zinc-900! font-light! border-1 border-black dark:border-white",
                          },
                        }}
                      >
                        Successfully submitted "{inputName}"
                      </Toast>
                    ),
                    {
                      autoClose: 4000,
                      toastId: inputName,
                    }
                  );
                }}
              >
                Submit
              </Button>
            </div>
          ) : (
            <div className="font-light dark:text-white overflow-y-auto flex flex-col shrink my-3">
              {names?.map((name) => (
                <div className="border-gray-200 dark:border-gray-700 border-1 px-3 py-1 mt-2 hover:border-red-600 dark:hover:border-red-600">
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
