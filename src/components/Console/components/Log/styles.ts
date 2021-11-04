import styled from "styled-components";

export const Container = styled.div`
  --icon-color: ${(props) => props.theme.colors.logText};

  border-radius: 0.25rem; // 4px
  padding: 0.5rem;
  color: ${(props) => props.theme.colors.logText};
  background-color: ${(props) => props.theme.colors.logBackground};
  margin-right: 2rem;

  display: flex;

  &[data-type="warn"] {
    --icon-color: ${(props) => props.theme.colors.yellow};

    color: ${(props) => props.theme.colors.warnText};
    background-color: ${(props) => props.theme.colors.warnBackground};
  }

  &[data-type="error"] {
    --icon-color: ${(props) => props.theme.colors.red};

    color: ${(props) => props.theme.colors.errorText};
    background-color: ${(props) => props.theme.colors.errorBackground};
  }

  &[data-type="send"] {
    background-color: ${(props) => props.theme.colors.sendBackground};
    margin-right: initial;
    margin-left: 2rem;
  }

  &:nth-child(n + 2) {
    margin-top: 0.1875rem; // 3px

    &[data-first-of-type="true"] {
      margin-top: 0.5rem; // 8px
    }
  }
`;

export const IConContainer = styled.div`
  color: var(--icon-color);
  font-size: 1rem;
  margin-right: 0.3125rem; // 5px

  display: flex;
  justify-content: center;
`;

export const Content = styled.pre`
  flex: 1;
  font-size: 0.875rem; // 14px
  white-space: pre-wrap;
  letter-spacing: 0.75px;
  line-height: 1.25rem;
`;

export const Timestamp = styled.div`
  font-size: 0.75rem; // 12px
  align-self: flex-end;
  margin-left: 1rem;
  opacity: 0.8;
`;
