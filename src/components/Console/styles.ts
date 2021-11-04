import styled from "styled-components";

export const Container = styled.div`
  max-width: 600px;
  background-color: ${(props) => props.theme.colors.logArea};
  margin-left: auto;
  height: 100%;
  overflow-y: auto;
`;

export const LogContainer = styled.div`
  padding: 1rem 0.5rem;
`;
