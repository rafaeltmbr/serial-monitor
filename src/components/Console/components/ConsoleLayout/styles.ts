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

export const LogContainer = styled.ul`
  padding: 1rem 0.5rem;
  flex: 1;
  overflow-y: auto;

  &[data-child-full-size="true"] {
    display: flex;
  }
`;
