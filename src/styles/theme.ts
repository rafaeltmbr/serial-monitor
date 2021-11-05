const config = {
  breakingPoints: {
    mobile: 768,
    smallDesktop: 1024,
  },
};

const darkColors = {
  icon: "#89A3F5",
  yellow: "#F1FA8C",
  red: "#FF5555",
  page: "#373849",
  logArea: "#23242F",
  logText: "#D8DCE9",
  warnText: "#F0F0C2",
  errorText: "#FFCECE",
  logBackground: "#2E2F3D",
  warnBackground: "#45462F",
  errorBackground: "#502D2D",
  sendBackground: "#3D415C",
  consoleHeader: "#292B38",
  consoleInput: "#44475A",
  consoleInputPlaceholder: "#A8ABBD",
  consoleScrollbar: "#44475A",
  consoleScrollbarHover: "#53576E",
  logIcon: "#56CCF2",
  warnIcon: "#EBF393",
  errorIcon: "#FF5555",
  managementBar: "#1E2029",
  managementBarText: "#E0E0E2",
  baudOptionHover: "#272834",
};

export const darkTheme = {
  ...config,
  colors: darkColors,
};

export type ITheme = typeof darkTheme;
