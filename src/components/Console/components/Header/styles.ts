import styled from "styled-components";

export const Container = styled.div`
  padding: 0.75rem 0.5rem 0.5rem;
  background-color: ${(props) => props.theme.colors.consoleHeader};
`;

export const LogTypesContainer = styled.div`
  margin-top: 0.5rem;

  display: flex;
`;
