import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.logArea};

  display: flex;
  flex-direction: column;
`;

export const LogsAndScrollButtonsContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

export const LogContainer = styled.ul`
  height: 100%;
  padding: 1rem 0.5rem;
  overflow-y: auto;

  &[data-child-full-size="true"] {
    display: flex;
  }
`;
