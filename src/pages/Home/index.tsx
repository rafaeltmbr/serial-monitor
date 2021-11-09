import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Console } from "../../components/Console";
import { defaultBaudRate } from "../../config/baud";
import { ILog } from "../../interfaces/Log/ILog";
import { getRandomId } from "../../util/getRandomId";
import {
  SerialConnection,
  SerialConnectionStatus,
} from "../../util/SerialConnection";

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

  const handleSerialConnect = useCallback((reused: boolean) => {
    setLogs((d) => [
      ...d,
      {
        id: getRandomId(),
        content: `Device ${reused ? "port reopened" : "connected"}`,
        type: "info",
        timestamp: new Date(),
      },
    ]);

    setIsConnected(true);
  }, []);

  const handleSerialDisconnect = useCallback(
    async (status: SerialConnectionStatus) => {
      const disconnectLog: ILog = {
        id: getRandomId(),
        content: `Device ${
          status === "disconnected" ? "disconnected" : "port closed"
        }`,
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

      if (status === "disconnected") setReadyToConnect(false);
    },
    []
  );

  useEffect(() => {
    serial.addListener("chunk", handleSerialChunk);
    serial.addListener("line", handleSerialLine);
    serial.addListener("connect", handleSerialConnect);
    serial.addListener("disconnect", handleSerialDisconnect);

    return () => {
      serial.removeListener("chunk", handleSerialChunk);
      serial.removeListener("line", handleSerialLine);
      serial.removeListener("connect", handleSerialConnect);
      serial.removeListener("disconnect", handleSerialDisconnect);
    };
  }, [
    handleSerialChunk,
    handleSerialLine,
    handleSerialConnect,
    handleSerialDisconnect,
    serial,
  ]);

  useEffect(() => {
    if (!readyToConnect) return;

    const connect = async () => {
      try {
        await serial.connect({ baudRate: baud });
      } catch (err: any) {
        setLogs((d) => [
          ...d,
          {
            id: getRandomId(),
            content: err.message,
            type: "info",
            timestamp: new Date(),
          },
        ]);

        setReadyToConnect(false);
      }
    };

    connect();
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
