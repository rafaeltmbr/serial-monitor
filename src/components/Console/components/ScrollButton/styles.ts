import styled from "styled-components";

export const Button = styled.button`
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.icon};
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border: none;
  transition-duration: 0.25s;
  transition-delay: 0.2s;

  font-size: 1.125rem;
  color: ${(props) => props.theme.colors.logArea};

  display: flex;
  align-items: center;
  justify-content: center;

  & > * {
    transform: rotateZ(270deg);
  }

  &[data-top="true"] {
    & > * {
      transform: rotateZ(90deg);
    }
  }

  &[data-show="false"] {
    opacity: 0;
    pointer-events: none;
  }
`;
