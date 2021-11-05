import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  padding: 1rem;
  overflow-y: auto;

  display: flex;
`;

export const Content = styled.div`
  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
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
