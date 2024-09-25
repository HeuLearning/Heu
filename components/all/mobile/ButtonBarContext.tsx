import React, { createContext, useContext, ReactNode } from "react";

interface ButtonBarContextType {
  handleSubmitAnswer: () => void;
  setHandleSubmitAnswer: React.Dispatch<React.SetStateAction<() => void>>;
}

// Create the context with a default value
const ButtonBarContext = createContext<ButtonBarContextType | undefined>(
  undefined,
);

interface ButtonBarProviderProps {
  children: ReactNode;
  value: ButtonBarContextType;
}

export function ButtonBarProvider({ children, value }: ButtonBarProviderProps) {
  return (
    <ButtonBarContext.Provider value={value}>
      {children}
    </ButtonBarContext.Provider>
  );
}

// Custom hook for using this context
export function useButtonBar(): ButtonBarContextType {
  const context = useContext(ButtonBarContext);
  if (context === undefined) {
    throw new Error("useButtonBar must be used within a ButtonBarProvider");
  }
  return context;
}
