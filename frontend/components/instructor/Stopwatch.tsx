import React from "react";
import useStopwatch from "./hooks/useStopwatch";

export default function Stopwatch() {
  const [{ isRunning, elapsedTime }, { start, stop, reset }] = useStopwatch();

  return (
    <div>
      <p>Time: {elapsedTime} seconds</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => console.log(lap())}>Lap</button>
    </div>
  );
}
