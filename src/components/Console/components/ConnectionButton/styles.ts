import styled from "styled-components";

export const Container = styled.div`
  height: 2rem;
  padding: 0 0.5rem;
  user-select: none;
  cursor: pointer;

  display: flex;
  align-items: center;
`;

export const Label = styled.span`
  color: ${(props) => props.theme.colors.managementBarText};
  font-size: 0.875rem;
  line-height: 1em;
`;

export const IconContainer = styled.span`
  color: ${(props) => props.theme.colors.icon};
  margin-left: 0.25rem;
  font-size: 1rem;
  line-height: 1em;
`;
