import styled from "styled-components";

export const Container = styled.div`
  --icon-color: ${(props) => props.theme.colors.logText};

  border-radius: 0.25rem;
  padding: 0.5rem;
  color: ${(props) => props.theme.colors.logText};
  background-color: ${(props) => props.theme.colors.logBackground};
  margin-right: 2rem;
  overflow: hidden;

  display: flex;

  &[data-type="warn"] {
    --icon-color: ${(props) => props.theme.colors.warnIcon};

    color: ${(props) => props.theme.colors.warnText};
    background-color: ${(props) => props.theme.colors.warnBackground};
  }

  &[data-type="error"] {
    --icon-color: ${(props) => props.theme.colors.errorIcon};

    color: ${(props) => props.theme.colors.errorText};
    background-color: ${(props) => props.theme.colors.errorBackground};
  }

  &[data-type="send"] {
    background-color: ${(props) => props.theme.colors.sendBackground};
    margin-right: initial;
    margin-left: 2rem;
  }

  &:nth-child(n + 2) {
    margin-top: 0.1875rem;

    &[data-first-of-type="true"] {
      margin-top: 0.5rem;
    }
  }
`;

export const IConContainer = styled.div`
  color: var(--icon-color);
  font-size: 1rem;
  margin-right: 0.3125rem;

  display: flex;
  justify-content: center;
`;

export const Content = styled.pre`
  flex: 1;
  font-size: 0.875rem;
  white-space: pre-wrap;
  letter-spacing: 0.75px;
  line-height: 1.25rem;
`;

export const Timestamp = styled.div`
  font-size: 0.75rem;
  align-self: flex-end;
  margin-left: 1rem;
  opacity: 0.8;
`;
