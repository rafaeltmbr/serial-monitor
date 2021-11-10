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
  display: none;
  font-size: 2.25rem;
  color: ${(props) => props.theme.colors.icon};
`;

export const Message = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 1.125rem;
  color: ${(props) => props.theme.colors.logText};
`;

export const Button = styled.button`
  margin-top: 1.5rem;
  background-color: ${(props) => props.theme.colors.consoleInput};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;
`;

export const ButtonText = styled.span`
  margin-right: 0.375rem;
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
