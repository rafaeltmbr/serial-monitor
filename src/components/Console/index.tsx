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
import { filterLogAndCount } from "../../util/filterLogAndCount";
import { getRandomId } from "../../util/getRandomId";
import {
  SerialConnection,
  SerialConnectionStatus,
} from "../../util/SerialConnection";

const LOG_PAGE_SIZE = 30; // 50 logs per page
const WINDOW_PAGES_SIZE = 3; // 3 * LOG_PAGE_SIZE

export const Console: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logChunk, setLogChunk] = useState<ILog | null>(null);
  const [page, setPage] = useState(WINDOW_PAGES_SIZE);
  const [baud, setBaud] = useState(defaultBaudRate);
  const [readyToConnect, setReadyToConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const serial = useMemo(() => new SerialConnection(), []);
  const scrollRef = useRef<Element>();
  const detectUserScroll = useMemo(() => ({ enabled: false }), []);

  const handleClearLogs = () => {
    setPage(WINDOW_PAGES_SIZE);
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
    setAutoScroll(isConnected);
  }, [isConnected]);

  useEffect(() => {
    setPage(WINDOW_PAGES_SIZE);
  }, [search, selectedType]);

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

  const [filteredLogs, logTypesCount] = useMemo(
    () => filterLogAndCount(logs, search, selectedType),
    [logs, search, selectedType]
  );

  const { logsSlice, pages } = useMemo(() => {
    const newLogs = logChunk ? [...filteredLogs, logChunk] : filteredLogs;

    const pageStart = (page - WINDOW_PAGES_SIZE) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + WINDOW_PAGES_SIZE * LOG_PAGE_SIZE;

    const logsSlice = newLogs.slice(pageStart, pageEnd);
    const pages = Math.ceil(newLogs.length / LOG_PAGE_SIZE);

    detectUserScroll.enabled = false;

    return { logsSlice, pages };
  }, [filteredLogs, logChunk, page, detectUserScroll]);

  useEffect(() => {
    if (autoScroll) setPage(pages);
  }, [autoScroll, pages]);

  useEffect(() => {
    detectUserScroll.enabled = true;

    if (autoScroll)
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [logsSlice, autoScroll, scrollRef, detectUserScroll]);

  useScrollThreshold(
    () => setPage((p) => (p > WINDOW_PAGES_SIZE ? p - 1 : p)),
    [],
    scrollRef,
    { offset: { top: 300 } }
  );

  useScrollThreshold(
    () => setPage((p) => (p > WINDOW_PAGES_SIZE ? p - 1 : p)),
    [],
    scrollRef,
    { ratio: { y: { min: 0.02 } } }
  );

  useScrollThreshold(
    () => setPage((p) => (p < pages ? p + 1 : p)),
    [pages],
    scrollRef,
    { offset: { bottom: 300 } }
  );

  useScrollThreshold(
    () => setPage((p) => (p < pages ? p + 1 : p)),
    [pages],
    scrollRef,
    { ratio: { y: { max: 0.98 } } }
  );

  useScrollThreshold(
    () => {
      if (page === pages) setAutoScroll(true);
    },
    [page, pages, autoScroll],
    scrollRef,
    { ratio: { y: { max: 0.99 } } }
  );

  useScrollThreshold(
    () => setAutoScroll(!detectUserScroll.enabled),
    [autoScroll],
    scrollRef,
    { ratio: { y: { min: 0.98 } } }
  );

  return (
    <ConsoleLayout
      logs={logsSlice}
      logTypesCount={logTypesCount}
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
