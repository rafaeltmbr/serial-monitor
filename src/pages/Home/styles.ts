import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  background-color: ${(props) => props.theme.colors.page};

  display: flex;
  justify-content: flex-end;
`;
