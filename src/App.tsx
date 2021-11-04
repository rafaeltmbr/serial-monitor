import React from "react";

import { Theme } from "./hooks/Theme";

import { Home } from "./pages/Home";
import { GlobalStyles } from "./styles/global";

export const App: React.FC = () => (
  <Theme>
    <GlobalStyles />
    <Home />
  </Theme>
);
