import styled from "styled-components";

export const Container = styled.div`
  padding: 0.75rem 0.5rem 0.5rem;
  background-color: ${(props) => props.theme.colors.consoleHeader};

  display: grid;
  grid-template-areas:
    "search search"
    "types clear";
  grid-template-columns: 1fr auto;
  row-gap: 0.5rem;
`;

export const LogTypesContainer = styled.div`
  grid-area: types;

  display: flex;
`;
