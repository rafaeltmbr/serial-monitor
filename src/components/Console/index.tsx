import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConsoleLayout } from "../../components/Console/components/ConsoleLayout";
import { defaultBaudRate } from "../../config/baud";
import { useAccumulatorInterval } from "../../hooks/AccumulatorInterval";
import { useDebounceEffect } from "../../hooks/DebounceEffect";
import { useScrollDirection } from "../../hooks/ScrollDirection";
import { useScrollThreshold } from "../../hooks/ScrollThreshold";
import { ILog, LogType } from "../../interfaces/Log/ILog";
import { filterLogAndCount } from "./util/filterLogAndCount";
import { makeLog } from "./util/makeLog";
import {
  SerialConnection,
  SerialConnectionStatus,
} from "./util/SerialConnection";

const LOG_PAGE_SIZE = 30; // 50 logs per page
const WINDOW_PAGES_SIZE = 3; // 3 * LOG_PAGE_SIZE
const LOG_REFRESH_TIMEOUT = 200; // 5x per second
const STEADY_LOG_DELAY = 10;

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
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [renderId, setRenderId] = useState(0);
  const serial = useMemo(() => new SerialConnection(), []);
  const scrollRef = useRef<Element>();
  const detectUserScroll = useRef(false);

  const handleClearLogs = useCallback(() => {
    setPage(WINDOW_PAGES_SIZE);
    setAutoScroll(true);
    setLogs([]);
    setShowScrollTopButton(false);
    setShowScrollDownButton(false);
    setRenderId((id) => id + 1);
  }, []);

  const handleBaudRateChange = useCallback((value: number) => {
    setBaud(value);
  }, []);

  const pushNewLogChunk = useAccumulatorInterval<string | null>(
    (chunks) => {
      const chunkContent = chunks[chunks.length - 1];

      const chunk = makeLog("log", chunkContent || "");

      setLogChunk(chunkContent ? chunk : null);
    },
    [],
    LOG_REFRESH_TIMEOUT
  );

  const handleSerialChunk = useCallback(pushNewLogChunk, [pushNewLogChunk]);

  const pushNewLogLine = useAccumulatorInterval<ILog>(
    (accLogs) => {
      pushNewLogChunk(null);
      setLogs((d) => [...d, ...accLogs]);
    },
    [],
    LOG_REFRESH_TIMEOUT
  );

  const handleSerialLine = useCallback(
    (line: string) => pushNewLogLine(makeLog("log", line)),
    [pushNewLogLine]
  );

  const handleSerialConnect = useCallback(
    (reused: boolean) => {
      pushNewLogLine(
        makeLog("info", `Device ${reused ? "port reopened" : "connected"}`)
      );

      setIsConnected(true);
    },
    [pushNewLogLine]
  );

  const handleSerialDisconnect = useCallback(
    async (status: SerialConnectionStatus) => {
      const msg = `Device ${
        status === "disconnected" ? "disconnected" : "port closed"
      }`;
      const disconnectLog: ILog = makeLog("info", msg);

      let chunk: ILog | null = null;

      setLogChunk((d) => {
        chunk = d;
        return d;
      });

      if (chunk) pushNewLogLine(chunk);

      pushNewLogLine(disconnectLog);
      pushNewLogChunk(null);
      setIsConnected(false);

      if (status === "disconnected") setReadyToConnect(false);
    },
    [pushNewLogChunk, pushNewLogLine]
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
      } catch (err: unknown) {
        pushNewLogLine(makeLog("info", (err as Error).message));

        setReadyToConnect(false);
      }
    };

    connect();
  }, [readyToConnect, baud, serial, pushNewLogLine]);

  useEffect(() => {
    if (readyToConnect) return;

    serial.disconnect();
  }, [readyToConnect, serial]);

  const [filteredLogs, logTypesCount] = useMemo(
    () => filterLogAndCount(logs, search, selectedType),
    [logs, search, selectedType]
  );

  const pages = Math.max(
    Math.ceil(filteredLogs.length / LOG_PAGE_SIZE),
    WINDOW_PAGES_SIZE
  );

  const currentPage = autoScroll ? pages : page;

  const logsSlice = useMemo(() => {
    const pageStart = (currentPage - WINDOW_PAGES_SIZE) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + WINDOW_PAGES_SIZE * LOG_PAGE_SIZE;

    const logsSlice = filteredLogs.slice(pageStart, pageEnd);

    detectUserScroll.current = false;

    return logsSlice;
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    if (autoScroll) setPage(Math.max(pages, WINDOW_PAGES_SIZE));
  }, [autoScroll, pages]);

  useScrollThreshold(
    () => setPage((p) => (p > WINDOW_PAGES_SIZE ? p - 1 : p)),
    [],
    scrollRef,
    { offset: { top: { min: 500 } } }
  );

  useScrollThreshold(
    () => setPage((p) => (p > WINDOW_PAGES_SIZE ? p - 1 : p)),
    [],
    scrollRef,
    { offset: { top: { min: 100 } } }
  );

  useScrollThreshold(
    () => setPage((p) => (p < pages ? p + 1 : p)),
    [pages],
    scrollRef,
    { offset: { bottom: { min: 500 } } }
  );

  useScrollThreshold(
    () => setPage((p) => (p < pages ? p + 1 : p)),
    [pages],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      if (page === Math.max(pages, WINDOW_PAGES_SIZE)) {
        setAutoScroll(true);
        setShowScrollDownButton(false);
      }
    },
    [page, pages, autoScroll],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      if (autoScroll && detectUserScroll.current) setAutoScroll(false);
    },
    [autoScroll],
    scrollRef,
    { offset: { bottom: { max: 1 } } }
  );

  useScrollThreshold(
    () => {
      setShowScrollTopButton(false);
    },
    [autoScroll],
    scrollRef,
    { offset: { top: { min: 50 } } }
  );

  useScrollDirection(
    (direction) => setShowScrollTopButton(direction.y < 0),
    [],
    scrollRef
  );

  useScrollDirection(
    (direction) => setShowScrollDownButton(direction.y > 0 && !autoScroll),
    [autoScroll],
    scrollRef
  );

  const handleScrollTopClick = useCallback(() => {
    setAutoScroll(false);
    setPage(WINDOW_PAGES_SIZE);
    scrollRef.current?.scrollTo(0, 0);
    setShowScrollTopButton(false);
  }, []);

  const handleScrollDownClick = useCallback(() => {
    setAutoScroll(true);
    setShowScrollDownButton(false);
  }, []);

  useDebounceEffect(
    () => setRenderId((id) => id + 1),
    [logsSlice, logChunk],
    STEADY_LOG_DELAY
  );

  const isFiltering = search || selectedType;

  const consoleState = useMemo(
    () => ({
      search,
      selectedType,
      logs: logsSlice,
      logChunk: isFiltering ? null : logChunk,
      baud,
      deviceInfo: isConnected ? "Connected" : "",
      logsContainerRef: scrollRef,
      logTypesCount,
      showScrollTopButton,
      showScrollDownButton,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderId, isFiltering, isConnected]
  );

  useEffect(() => {
    detectUserScroll.current = true;

    if (autoScroll)
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [consoleState, autoScroll]);

  return (
    <ConsoleLayout
      {...consoleState}
      onSearch={setSearch}
      onSelectedType={setSelectedType}
      onClearLogs={handleClearLogs}
      onBaudChange={handleBaudRateChange}
      onConnectionRequestChange={setReadyToConnect}
      onScrollTopClick={handleScrollTopClick}
      onScrollDownClick={handleScrollDownClick}
    />
  );
};
