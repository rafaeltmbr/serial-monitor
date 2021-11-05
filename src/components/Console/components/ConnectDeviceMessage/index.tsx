import React from "react";
import { MdUsb, MdUsbOff } from "react-icons/md";

import {
  Button,
  ButtonIcon,
  ButtonText,
  Container,
  Icon,
  Message,
} from "./styles";

interface IProps {
  show: boolean;
  onConnectionRequest: () => void;
}

export const ConnectDeviceMessage: React.FC<IProps> = ({
  show,
  onConnectionRequest,
}) => (
  <Container data-show={show}>
    <Icon>
      <MdUsbOff />
    </Icon>
    <Message>No device connected</Message>
    <Button onClick={() => onConnectionRequest()}>
      <ButtonText>Connect</ButtonText>
      <ButtonIcon>
        <MdUsb />
      </ButtonIcon>
    </Button>
  </Container>
);
