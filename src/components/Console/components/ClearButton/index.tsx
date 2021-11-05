import React from "react";
import { FaTrashAlt } from "react-icons/fa";

import { Container, IconContainer, Text } from "./styles";

interface IProps {
  onClick: () => void;
}

export const ClearButton: React.FC<IProps> = ({ onClick }) => {
  return (
    <Container onClick={() => onClick()}>
      <Text>Clear</Text>
      <IconContainer>
        <FaTrashAlt />
      </IconContainer>
    </Container>
  );
};
