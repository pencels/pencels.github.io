import moment from "moment";
import { useEffect, useState } from "react";

function formatDuration(milliseconds: number): string {
  const duration = moment.duration(milliseconds);
  let result = "";

  const params: moment.unitOfTime.Base[] = [
    "year",
    "month",
    "week",
    "day",
    "hour",
    "minute",
  ];

  let added = 0;
  for (const name of params) {
    const v = duration.get(name);
    if (v > 0) {
      if (added > 0) {
        result += ", ";
      }
      result += v;

      if (v < 2) {
        result += " " + name;
      } else {
        result += " " + name + "s";
      }
      added += 1;
    }
  }

  if (added > 1) {
    result += " and ";
  }

  const ms = duration.milliseconds();

  result += `${ms.toFixed(2)} seconds`;

  return result;
}

function App() {
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [elapsed, setElapsed] = useState<number | undefined>(undefined);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (pressed && startTime !== undefined) {
      const id = setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
      }, 10);
      return () => {
        clearInterval(id);
      };
    }
  }, [pressed, startTime]);

  const onPress = () => {
    setPressed(true);
    setStartTime(Date.now());
  };

  const onRelease = () => {
    setPressed(false);
  };

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "w" && !e.repeat) {
        onPress();
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "w") {
        onRelease();
      }
    });
    document.addEventListener("mouseup", onRelease);
    document.addEventListener("touchend", onRelease);
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center bg-amber-100 text-amber-900">
      <h1 className="mx-auto text-5xl flex items-center"></h1>
      <div className="mx-auto scene">
        <div
          className={`key flex cursor-pointer select-none ${
            pressed ? "pressed" : ""
          }`}
          onMouseDown={onPress}
          onTouchStart={onPress}
        >
          <div className="plane"></div>
          <div className="top cube__face--front text-amber-100 select-none flex justify-center items-center">
            W
          </div>
          <div className="top select-none cube__face--back"></div>
          <div className="side select-none cube__face--right"></div>
          <div className="side select-none cube__face--left"></div>
          <div className="side select-none cube__face--top"></div>
          <div className="side select-none cube__face--bottom"></div>
        </div>
      </div>
      <div
        className={`text-center mt-2 mx-auto text-xl ${
          pressed ? "fade-in" : "fade-out"
        }`}
      >
        {elapsed !== undefined ? (
          `you held W for ${formatDuration(elapsed)}`
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  );
}

export default App;
