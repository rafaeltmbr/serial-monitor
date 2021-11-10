import styled from "styled-components";

export const Container = styled.div`
  margin-top: 0.5rem;
  grid-area: message;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.logText};
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`;

export const Highlight = styled.span`
  font-weight: bold;
`;
