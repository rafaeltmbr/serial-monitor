import styled from "styled-components";

export const Container = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  bottom: 1rem;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
