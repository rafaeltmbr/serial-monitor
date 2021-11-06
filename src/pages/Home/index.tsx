import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Console } from "../../components/Console";
import { defaultBaudRate } from "../../config/baud";
import { ILog } from "../../interfaces/Log/ILog";
import { getRandomId } from "../../util/getRandomId";
import { SerialConnection } from "../../util/SerialConnection";

import { Container } from "./styles";

export const Home: React.FC = () => {
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logChunk, setLogChunk] = useState<ILog | null>(null);
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

  const handleSerialChunk = useCallback((chunk: string) => {
    setLogChunk({
      id: getRandomId(),
      type: "log",
      content: chunk,
      timestamp: new Date(),
    });
  }, []);

  const handleSerialLine = useCallback((line: string) => {
    setLogChunk(null);
    setLogs((d) => [
      ...d,
      {
        id: getRandomId(),
        type: "log",
        content: line,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSerialDisconnect = useCallback(async () => {
    const disconnectLog: ILog = {
      id: getRandomId(),
      content: "Device disconnected",
      type: "info",
      timestamp: new Date(),
    };

    let chunk: ILog | null;

    setLogChunk((d) => {
      chunk = d;
      return null;
    });

    setLogs((d) =>
      chunk ? [...d, chunk, disconnectLog] : [...d, disconnectLog]
    );
    setIsConnected(false);
    setReadyToConnect(false);
  }, []);

  useEffect(() => {
    serial.addListener("chunk", handleSerialChunk);
    serial.addListener("line", handleSerialLine);
    serial.addListener("disconnect", handleSerialDisconnect);

    return () => {
      serial.removeListener("chunk", handleSerialChunk);
      serial.removeListener("line", handleSerialLine);
      serial.removeListener("disconnect", handleSerialDisconnect);
    };
  }, [handleSerialChunk, handleSerialLine, handleSerialDisconnect, serial]);

  useEffect(() => {
    if (!readyToConnect) return;

    serial.connect({ baudRate: baud }).then(() => {
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
    });
  }, [readyToConnect, baud, serial]);

  useEffect(() => {
    if (readyToConnect) return;

    serial.disconnect();
  }, [readyToConnect, serial]);

  return (
    <Container>
      <Console
        logs={logChunk ? [...logs, logChunk] : logs}
        baud={baud}
        onBaudChange={handleBaudRateChange}
        deviceInfo={isConnected ? "Connected" : ""}
        onClearLogs={handleClearLogs}
        onConnectionRequestChange={setReadyToConnect}
      />
    </Container>
  );
};
