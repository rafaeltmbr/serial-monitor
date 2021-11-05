import styled from "styled-components";

export const Container = styled.div`
  grid-area: clear;
  background-color: ${(props) => props.theme.colors.consoleInput};
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1rem;
  user-select: none;
  cursor: pointer;

  display: flex;
`;

export const Text = styled.span`
  color: ${(props) => props.theme.colors.logText};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IconContainer = styled.span`
  margin-left: 0.4rem;
  color: ${(props) => props.theme.colors.icon};

  display: flex;
  align-items: center;
  justify-content: center;
`;
