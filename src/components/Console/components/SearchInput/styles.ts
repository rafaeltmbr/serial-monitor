import styled from "styled-components";

export const Container = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.375rem 4rem 0.375rem 0.75rem;
  background-color: ${(props) => props.theme.colors.consoleInput};
  border: none;
  border-radius: 0.25rem;
  color: ${(props) => props.theme.colors.logText};

  font-size: 1rem;
  line-height: 1.25rem;

  &::placeholder {
    color: ${(props) => props.theme.colors.consoleInputPlaceholder};
  }

  &:focus {
    outline: 2px solid ${(props) => props.theme.colors.icon};
  }
`;

export const SearchIconContainer = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 0;

  font-size: 1.25rem;
  height: 2rem;
  width: 1.5rem;
  color: ${(props) => props.theme.colors.icon};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ClearIconContainer = styled.div`
  position: absolute;
  right: 2rem;
  top: 0;

  font-size: 1.5rem;
  height: 2rem;
  width: 1.5rem;
  color: ${(props) => props.theme.colors.icon};
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;
