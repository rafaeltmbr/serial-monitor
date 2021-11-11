import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConsoleLayout } from "../../components/Console/components/ConsoleLayout";
import { defaultBaudRate } from "../../config/baud";
import { useScrollThreshold } from "../../hooks/ScrollThreshold";
import { ILog, LogType } from "../../interfaces/Log/ILog";
import { getRandomId } from "../../util/getRandomId";
import {
  SerialConnection,
  SerialConnectionStatus,
} from "../../util/SerialConnection";

const LOG_PAGE_SIZE = 50; // 50 logs per page

export const Console: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logChunk, setLogChunk] = useState<ILog | null>(null);
  const [page, setPage] = useState(1);
  const [baud, setBaud] = useState(defaultBaudRate);
  const [readyToConnect, setReadyToConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const serial = useMemo(() => new SerialConnection(), []);
  const scrollRef = useRef<Element>();

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

  const consoleLogs = useMemo(() => {
    const newLogs = logChunk ? [...logs, logChunk] : logs;

    const pageStart = (page - 1) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + LOG_PAGE_SIZE;

    return newLogs.slice(pageStart, pageEnd);
  }, [logs, logChunk, page]);

  useScrollThreshold(
    () => {
      console.log("threshold triggered");
    },
    [],
    scrollRef,
    {
      offset: {
        bottom: 200,
      },
    }
  );

  return (
    <ConsoleLayout
      logs={consoleLogs}
      baud={baud}
      onBaudChange={handleBaudRateChange}
      deviceInfo={isConnected ? "Connected" : ""}
      onClearLogs={handleClearLogs}
      onConnectionRequestChange={setReadyToConnect}
      search={search}
      onSearch={setSearch}
      selectedType={selectedType}
      onSelectedType={setSelectedType}
      logsContainerRef={scrollRef}
    />
  );
};
