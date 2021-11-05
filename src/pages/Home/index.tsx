import React, { useEffect, useMemo, useState } from "react";
import { Console } from "../../components/Console";
import { defaultBaudRate } from "../../config/baud";
import { ILog } from "../../interfaces/Log/ILog";
import { getRandomId } from "../../util/getRandomId";
import { SerialConnection } from "../../util/SerialConnection";

import { Container } from "./styles";

export const Home: React.FC = () => {
  const [logs, setLogs] = useState<ILog[]>([]);
  const [baud, setBaud] = useState(defaultBaudRate);
  const [readyToConnect, setReadyToConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const serial = useMemo(() => new SerialConnection(), []);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleBaudRateChange = (value: number) => {
    setBaud(value);
  };

  useEffect(() => {
    if (!readyToConnect) return;

    serial.connect({ baudRate: baud });
    setLogs((d) => [
      ...d,
      {
        id: getRandomId(),
        content: "Device connected",
        type: "info",
        timestamp: new Date(),
      },
    ]);
    setIsConnected(true);

    const handleNewLine = (line: string) => {
      setLogs((d) => [
        ...d,
        {
          id: getRandomId(),
          type: "log",
          content: line,
          timestamp: new Date(),
        },
      ]);
    };

    const handleDisconnect = () => {
      serial.disconnect();
      setLogs((d) => [
        ...d,
        {
          id: getRandomId(),
          content: "Device disconnected",
          type: "info",
          timestamp: new Date(),
        },
      ]);
      setIsConnected(false);
      setReadyToConnect(false);
    };

    serial.addListener("line", handleNewLine);
    serial.addListener("disconnect", handleDisconnect);

    return () => {
      handleDisconnect();
      serial.removeListener("line", handleNewLine);
      serial.removeListener("disconnect", handleDisconnect);
    };
  }, [serial, readyToConnect, baud]);

  return (
    <Container>
      <Console
        logs={logs}
        baud={baud}
        onBaudChange={handleBaudRateChange}
        deviceInfo={isConnected ? "Connected" : ""}
        onClearLogs={handleClearLogs}
        onConnectionRequestChange={setReadyToConnect}
      />
    </Container>
  );
};
