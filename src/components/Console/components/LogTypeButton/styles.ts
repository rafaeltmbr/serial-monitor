import styled from "styled-components";

export const Container = styled.div`
  background-color: ${(props) => props.theme.colors.consoleInput};
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  user-select: none;
  cursor: pointer;

  font-size: 1rem;
  line-height: 1em;

  display: flex;
  align-items: center;

  &:nth-child(n + 2) {
    margin-left: 0.5rem;
  }

  &[data-type="log"] {
    color: ${(props) => props.theme.colors.logIcon};
  }

  &[data-type="warn"] {
    color: ${(props) => props.theme.colors.warnIcon};
  }

  &[data-type="error"] {
    color: ${(props) => props.theme.colors.errorIcon};
  }

  &[data-type="send"] {
    color: ${(props) => props.theme.colors.icon};
  }

  &[data-selected="true"] {
    outline: 2px solid ${(props) => props.theme.colors.icon};
  }
`;

export const Count = styled.span`
  color: ${(props) => props.theme.colors.logText};
  margin-left: 0.25rem;
  font-size: 0.875rem;
  line-height: 1em;
`;
