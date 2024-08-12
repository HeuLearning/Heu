import { useState, useEffect, useCallback } from "react";

interface StopwatchState {
  isRunning: boolean;
  elapsedTime: number;
  elapsedLapTime: number;
}

interface StopwatchControls {
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  lapTimer: () => void;
  setElapsedTime: (time: number) => void;
}

const useStopwatch = (): [StopwatchState, StopwatchControls] => {
  const [state, setState] = useState<StopwatchState>({
    isRunning: false,
    elapsedTime: 0,
    elapsedLapTime: 0,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.isRunning) {
      intervalId = setInterval(() => {
        setState((prevState) => ({
          ...prevState,
          elapsedTime: prevState.elapsedTime + 1,
          elapsedLapTime: prevState.elapsedLapTime + 1,
        }));
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [state.isRunning]);

  const startTimer = useCallback(() => {
    setState((prevState) => ({ ...prevState, isRunning: true }));
  }, []);

  const stopTimer = useCallback(() => {
    setState((prevState) => ({ ...prevState, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setState({ isRunning: false, elapsedTime: 0, elapsedLapTime: 0 });
  }, []);

  const setElapsedTime = useCallback((time: number) => {
    setState((prevState) => ({ ...prevState, elapsedTime: time }));
  }, []);

  const lapTimer = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      elapsedLapTime: 0,
    }));
  }, []);

  return [
    state,
    { startTimer, stopTimer, resetTimer, lapTimer, setElapsedTime },
  ];
};

export default useStopwatch;
