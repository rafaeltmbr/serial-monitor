import styled from "styled-components";

export const Container = styled.div`
  padding: 1rem;
  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  &:nth-child(n + 2) {
    padding-top: 2rem;
  }

  &[data-show="false"] {
    display: none;
  }
`;

export const Icon = styled.div`
  font-size: 2.25rem;
  color: ${(props) => props.theme.colors.icon};
`;

export const Message = styled.div`
  margin-top: 0.5rem;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.logText};
`;

export const Button = styled.button`
  margin-top: 2rem;
  background-color: ${(props) => props.theme.colors.consoleInput};
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
`;

export const ButtonText = styled.span`
  margin-right: 0.25rem;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.logText};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ButtonIcon = styled.span`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.icon};

  display: flex;
  align-items: center;
  justify-content: center;
`;
