import React, { createContext, useContext, ReactNode, useMemo } from "react";
import useStopwatch from "../../../components/all/hooks/useStopwatch";

// Split into two contexts
const StopwatchStateContext = createContext<
  ReturnType<typeof useStopwatch>[0] | undefined
>(undefined);
const StopwatchControlsContext = createContext<
  ReturnType<typeof useStopwatch>[1] | undefined
>(undefined);

interface StopwatchProviderProps {
  children: ReactNode;
}

export const StopwatchProvider: React.FC<StopwatchProviderProps> = ({
  children,
}) => {
  const [state, controls] = useStopwatch();

  // Memoize the controls
  const memoizedControls = useMemo(() => controls, []);

  return (
    <StopwatchStateContext.Provider value={state}>
      <StopwatchControlsContext.Provider value={memoizedControls}>
        {children}
      </StopwatchControlsContext.Provider>
    </StopwatchStateContext.Provider>
  );
};

// Custom hooks to use the separate contexts
export const useStopwatchState = () => {
  const context = useContext(StopwatchStateContext);
  if (context === undefined) {
    throw new Error(
      "useStopwatchState must be used within a StopwatchProvider"
    );
  }
  return context;
};

export const useStopwatchControls = () => {
  const context = useContext(StopwatchControlsContext);
  if (context === undefined) {
    throw new Error(
      "useStopwatchControls must be used within a StopwatchProvider"
    );
  }
  return context;
};

// For backwards compatibility
export const useStopwatchContext = () => {
  const state = useStopwatchState();
  const controls = useStopwatchControls();
  return { state, controls };
};
