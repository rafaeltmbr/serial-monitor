import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: none;
    font-family: "Roboto", sans-serif;
  }


  // webkit based browsers

  ::-webkit-scrollbar {
    width: 0.5rem;
    height: 0.5rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.consoleScrollbar};
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.consoleScrollbarHover};
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }


  // mozila only

  * {
    scrollbar-width: thin;
    scrollbar-color: ${(props) =>
      props.theme.colors.consoleScrollbar} transparent;
  }
`;
