import React from "react";
import { BaudRateSelect } from "../BaudRateSelect";
import { ConnectionButton } from "../ConnectionButton";

import { Container, DeviceInfo } from "./styles";

interface IProps {
  deviceInfo: string;
  baud: number;
  onConnectionRequestChange: (isConnected: boolean) => void;
  onBaudChange: (baud: number) => void;
}

export const ManagementBar: React.FC<IProps> = ({
  deviceInfo,
  baud,
  onConnectionRequestChange,
  onBaudChange,
}) => {
  return (
    <Container>
      <ConnectionButton
        isConnected={!!deviceInfo}
        onConnectionRequestChange={onConnectionRequestChange}
      />
      <DeviceInfo>{deviceInfo}</DeviceInfo>
      <BaudRateSelect baud={baud} onBaudChange={onBaudChange} />
    </Container>
  );
};
