import React, { useEffect, useMemo, useState } from "react";
import { Console } from "../../components/Console";
import { defaultBaudRate } from "../../config/baud";
import { ILog } from "../../interfaces/Log/ILog";
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
    setIsConnected(true);

    const handleNewLine = (line: string) => {
      setLogs((d) => [
        ...d,
        {
          id: d.length + 1,
          type: "log",
          content: line,
          timestamp: new Date(),
        },
      ]);
    };

    const handleDisconnect = () => {
      serial.disconnect();
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
