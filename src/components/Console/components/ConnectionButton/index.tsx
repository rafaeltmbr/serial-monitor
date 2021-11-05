import React from "react";
import { MdUsb, MdUsbOff } from "react-icons/md";

import { Container, IconContainer, Label } from "./styles";

interface IProps {
  isConnected: boolean;
  onConnectionRequestChange: (isConnected: boolean) => void;
}

export const ConnectionButton: React.FC<IProps> = ({
  isConnected,
  onConnectionRequestChange,
}) => (
  <Container onClick={() => onConnectionRequestChange(!isConnected)}>
    <Label>{isConnected ? "Disconnect" : "Connect"}</Label>
    <IconContainer>{isConnected ? <MdUsbOff /> : <MdUsb />}</IconContainer>
  </Container>
);
