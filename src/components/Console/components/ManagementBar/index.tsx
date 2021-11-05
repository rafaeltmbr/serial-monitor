import React from "react";
import { BaudRateSelect } from "../BaudRateSelect";
import { ConnectionButton } from "../ConnectionButton";

import { Container, DeviceInfo } from "./styles";

interface IProps {
  isConnected: boolean;
  deviceInfo: string;
  baud: number;
  onConnectionRequestChange: (isConnected: boolean) => void;
  onBaudChange: (baud: number) => void;
}

export const ManagementBar: React.FC<IProps> = ({
  deviceInfo,
  isConnected,
  baud,
  onConnectionRequestChange,
  onBaudChange,
}) => {
  return (
    <Container>
      <ConnectionButton
        isConnected={isConnected}
        onConnectionRequestChange={onConnectionRequestChange}
      />
      <DeviceInfo>{deviceInfo}</DeviceInfo>
      <BaudRateSelect baud={baud} onBaudChange={onBaudChange} />
    </Container>
  );
};
