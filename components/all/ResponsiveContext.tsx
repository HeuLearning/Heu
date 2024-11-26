import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMediaQuery } from "react-responsive";

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

interface ResponsiveProviderProps {
  children: ReactNode;
}

const useResponsiveValues = (): ResponsiveContextType => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // If not mounted, return default values
  if (!isMounted) {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }

  return { isMobile, isTablet, isDesktop };
};

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
}) => {
  const responsiveValues = useResponsiveValues();

  return (
    <ResponsiveContext.Provider value={responsiveValues}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error("useResponsive must be used within a ResponsiveProvider");
  }
  return context;
};
