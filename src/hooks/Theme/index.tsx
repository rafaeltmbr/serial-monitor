import React, { createContext, useCallback, useContext, useState } from "react";
import { ThemeProvider } from "styled-components";

import { darkTheme } from "../../styles/theme";

const ThemeContext = createContext(() => {});

export const Theme: React.FC = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  const switchMode = useCallback(() => setTheme(() => darkTheme), []);

  return (
    <ThemeContext.Provider value={switchMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeSwitch = () => useContext(ThemeContext);
