import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

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
  updatePopUp: (id: string, newContent: ReactNode) => void;
  hidePopUp: (id: string) => void;
}

const PopUpContext = createContext<PopUpContextType | undefined>(undefined);

export function PopUpProvider({ children }: { children: ReactNode }) {
  const [popups, setPopUps] = useState<PopUpContent[]>([]);

  const showPopUp = useCallback((popup: PopUpContent) => {
    setPopUps((prev) => [...prev.filter((p) => p.id !== popup.id), popup]);
  }, []);

  const updatePopUp = useCallback((id: string, newContent: ReactNode) => {
    setPopUps((prev) =>
      prev.map((popup) =>
        popup.id === id ? { ...popup, content: newContent } : popup
      )
    );
  }, []);

  const hidePopUp = useCallback((id: string) => {
    setPopUps((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  return (
    <PopUpContext.Provider
      value={{ popups, showPopUp, updatePopUp, hidePopUp }}
    >
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
