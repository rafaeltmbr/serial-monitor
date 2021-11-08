import styled from "styled-components";

export const Container = styled.div`
  background-color: ${(props) => props.theme.colors.managementBar};

  display: flex;
  justify-content: space-between;

  z-index: 3;
`;

export const DeviceInfo = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) => props.theme.colors.managementBarText};
  font-size: 0.875rem;
  line-height: 1rem;
  padding: 0.5rem 0.25rem;
`;
