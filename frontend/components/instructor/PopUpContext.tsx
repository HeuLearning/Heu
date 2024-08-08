import React, { createContext, useState, useContext, ReactNode } from "react";

interface PopUpContent {
  id: string;
  content: ReactNode;
  container?: string | null;
  style?: {
    overlay?: string;
  };
  height?: string;
}

interface PopUpContextType {
  popups: PopUpContent[];
  showPopUp: (popup: PopUpContent) => void;
  hidePopUp: (id: string) => void;
}

const PopUpContext = createContext<PopUpContextType | undefined>(undefined);

export function PopUpProvider({ children }: { children: ReactNode }) {
  const [popups, setPopUps] = useState<PopUpContent[]>([]);

  const showPopUp = (popup: PopUpContent) => {
    setPopUps((prev) => [...prev, popup]);
  };

  const hidePopUp = (id: string) => {
    setPopUps((prev) => prev.filter((popup) => popup.id !== id));
  };

  return (
    <PopUpContext.Provider value={{ popups, showPopUp, hidePopUp }}>
      {children}
    </PopUpContext.Provider>
  );
}

export function usePopUp(): PopUpContextType {
  const context = useContext(PopUpContext);
  if (context === undefined) {
    throw new Error("usePopUp must be used within a PopUpProvider");
  }
  return context;
}
