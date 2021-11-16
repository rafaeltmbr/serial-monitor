import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConsoleLayout } from "../../components/Console/components/ConsoleLayout";
import { DEFAULT_BAUD_RATE } from "../../config/baud";
import { useRenderCount } from "../../hooks/RenderCount";
import { useScrollDirection } from "../../hooks/ScrollDirection";
import { useScrollThreshold } from "../../hooks/ScrollThreshold";
import { ILog, LogType } from "../../interfaces/Log/ILog";
import { KeyValueManager } from "../../util/KeyValueManager";
import { filterLogAndCount } from "./util/filterLogAndCount";
import { makeLog } from "./util/makeLog";
import {
  SerialConnection,
  SerialConnectionStatus,
} from "./util/SerialConnection";

const LOG_PAGE_SIZE = 30; // 50 logs per page
const WINDOW_PAGES_SIZE = 3; // 3 * LOG_PAGE_SIZE
const RENDER_REFRESH_INTERVAL = 200; // 5x per second

const initialState = {
  search: "",
  selectedType: undefined as LogType | undefined,
  logs: [] as ILog[],
  logChunk: null as ILog | null,
  page: WINDOW_PAGES_SIZE,
  baud: DEFAULT_BAUD_RATE,
  readyToConnect: false,
  isConnected: false,
  autoScroll: true,
  showScrollTopButton: false,
  showScrollDownButton: false,
};

export const Console: React.FC = () => {
  const kvm = useMemo(() => new KeyValueManager(initialState), []);
  const serial = useMemo(() => new SerialConnection(), []);
  const scrollRef = useRef<Element>();
  const detectUserScroll = useRef(false);
  const [renderId, setRenderId] = useState(0);

  useEffect(() => {
    const descriptor = setInterval(() => {
      setRenderId((id) => id + 1);
    }, RENDER_REFRESH_INTERVAL);

    return () => clearInterval(descriptor);
  }, []);

  const handleClearLogs = useCallback(() => {
    kvm.page = WINDOW_PAGES_SIZE;
    kvm.autoScroll = true;
    kvm.logs = [];
    kvm.showScrollTopButton = false;
    kvm.showScrollDownButton = false;

    setRenderId((id) => id + 1);
  }, [kvm]);

  const handleBaudRateChange = useCallback(
    (value: number) => (kvm.baud = value),
    [kvm]
  );

  const handleSerialChunk = useCallback(
    (content: string | null) =>
      (kvm.logChunk = content ? makeLog("log", content) : null),
    [kvm]
  );

  const pushNewLogLine = useCallback(
    (log: ILog) => {
      kvm.logChunk = null;
      kvm.logs = [...kvm.logs, log];
    },
    [kvm]
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

      kvm.isConnected = true;
    },
    [kvm, pushNewLogLine]
  );

  const handleSerialDisconnect = useCallback(
    async (status: SerialConnectionStatus) => {
      const msg = `Device ${
        status === "disconnected" ? "disconnected" : "port closed"
      }`;
      const disconnectLog: ILog = makeLog("info", msg);

      if (kvm.logChunk) pushNewLogLine(kvm.logChunk);

      pushNewLogLine(disconnectLog);
      kvm.logChunk = null;
      kvm.isConnected = false;
      kvm.autoScroll = true;

      if (status === "disconnected") kvm.readyToConnect = false;
    },
    [kvm, pushNewLogLine]
  );

  useEffect(() => {
    const handleIsConnectedChange = () => {
      kvm.autoScroll = kvm.isConnected;
    };

    kvm.addChangeListener("isConnected", handleIsConnectedChange);

    return () => {
      kvm.removeChangeListener("isConnected", handleIsConnectedChange);
    };
  }, [kvm]);

  useEffect(() => {
    const handleFilterChange = () => {
      kvm.page = WINDOW_PAGES_SIZE;
      kvm.showScrollDownButton = false;
      kvm.showScrollTopButton = false;
    };

    kvm.addChangeListener("search", handleFilterChange);
    kvm.addChangeListener("selectedType", handleFilterChange);

    return () => {
      kvm.removeChangeListener("search", handleFilterChange);
      kvm.removeChangeListener("selectedType", handleFilterChange);
    };
  }, [kvm]);

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
    const handleConnectionChange = async () => {
      try {
        if (!kvm.readyToConnect) return;

        await serial.connect({ baudRate: kvm.baud });
      } catch (err: unknown) {
        pushNewLogLine(makeLog("info", (err as Error).message));

        kvm.readyToConnect = false;
      }
    };

    kvm.addChangeListener("readyToConnect", handleConnectionChange);
    kvm.addChangeListener("baud", handleConnectionChange);

    return () => {
      kvm.removeChangeListener("readyToConnect", handleConnectionChange);
      kvm.removeChangeListener("baud", handleConnectionChange);
    };
  }, [kvm, serial, pushNewLogLine]);

  useEffect(() => {
    const handleReadyToConnect = async () => {
      if (!kvm.readyToConnect) await serial.disconnect();
    };

    kvm.addChangeListener("readyToConnect", handleReadyToConnect);

    return () => {
      kvm.removeChangeListener("readyToConnect", handleReadyToConnect);
    };
  }, [kvm, serial]);

  const [filteredLogs, logTypesCount] = useMemo(
    () => filterLogAndCount(kvm.logs, kvm.search, kvm.selectedType),
    [kvm.logs, kvm.search, kvm.selectedType]
  );

  const pages = Math.max(
    Math.ceil(filteredLogs.length / LOG_PAGE_SIZE),
    WINDOW_PAGES_SIZE
  );

  const lastPage = Math.max(pages, WINDOW_PAGES_SIZE);

  if (kvm.autoScroll) kvm.page = lastPage;

  const logsSlice = useMemo(() => {
    const pageStart = (kvm.page - WINDOW_PAGES_SIZE) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + WINDOW_PAGES_SIZE * LOG_PAGE_SIZE;

    const logsSlice = filteredLogs.slice(pageStart, pageEnd);

    return logsSlice;
  }, [kvm.page, filteredLogs]);

  useEffect(() => {
    const handleAutoScrollChange = () => {
      if (kvm.autoScroll) kvm.page = lastPage;
    };

    kvm.addChangeListener("autoScroll", handleAutoScrollChange);

    return () => {
      kvm.removeChangeListener("autoScroll", handleAutoScrollChange);
    };
  }, [kvm, lastPage]);

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p > WINDOW_PAGES_SIZE ? p - 1 : p;
    },
    [],
    scrollRef,
    { offset: { top: { min: 500 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p > WINDOW_PAGES_SIZE ? p - 1 : p;
    },
    [],
    scrollRef,
    { offset: { top: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p < pages ? p + 1 : p;
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 500 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.page;
      kvm.page = p < pages ? p + 1 : p;
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      const page = kvm.page;

      if (page === lastPage) {
        kvm.autoScroll = true;
        kvm.showScrollDownButton = false;
      }
    },
    [lastPage],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      if (kvm.autoScroll && detectUserScroll.current) kvm.autoScroll = false;
    },
    [],
    scrollRef,
    { offset: { bottom: { max: 1 } } }
  );

  useScrollThreshold(
    () => {
      kvm.showScrollTopButton = false;
    },
    [],
    scrollRef,
    { offset: { top: { min: 50 } } }
  );

  useScrollDirection(
    (direction) => (kvm.showScrollTopButton = direction.y < 0),
    [],
    scrollRef
  );

  useScrollDirection(
    (direction) =>
      (kvm.showScrollDownButton = direction.y > 0 && !kvm.autoScroll),
    [],
    scrollRef
  );

  const handleScrollTopClick = useCallback(() => {
    kvm.autoScroll = false;
    kvm.page = WINDOW_PAGES_SIZE;
    kvm.showScrollTopButton = false;

    scrollRef.current?.scrollTo(0, 0);
  }, [kvm]);

  const handleScrollDownClick = useCallback(() => {
    kvm.autoScroll = true;
    kvm.showScrollDownButton = false;
  }, [kvm]);

  const handleSearch = useCallback(
    (value: string) => {
      kvm.search = value;
      setRenderId((id) => id + 1);
    },
    [kvm]
  );

  const handleSelectedType = useCallback(
    (value: LogType | undefined) => {
      kvm.selectedType = value;
      setRenderId((id) => id + 1);
    },
    [kvm]
  );

  const handleReadyToConnect = useCallback(
    (value: boolean) => (kvm.readyToConnect = value),
    [kvm]
  );

  useEffect(() => {
    detectUserScroll.current = true;

    if (kvm.autoScroll)
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [kvm, renderId]);

  detectUserScroll.current = false;

  console.log(`${kvm.page} / ${pages}`);

  const isFiltering = kvm.search || kvm.selectedType;

  useRenderCount((count) => console.log(`UI Render: ${count}`));

  return (
    <ConsoleLayout
      search={kvm.search}
      selectedType={kvm.selectedType}
      logs={logsSlice}
      logChunk={isFiltering ? null : kvm.logChunk}
      baud={kvm.baud}
      deviceInfo={kvm.isConnected ? "Connected" : ""}
      logsContainerRef={scrollRef}
      logTypesCount={logTypesCount}
      showScrollTopButton={kvm.showScrollTopButton}
      showScrollDownButton={kvm.showScrollDownButton}
      onSearch={handleSearch}
      onSelectedType={handleSelectedType}
      onClearLogs={handleClearLogs}
      onBaudChange={handleBaudRateChange}
      onConnectionRequestChange={handleReadyToConnect}
      onScrollTopClick={handleScrollTopClick}
      onScrollDownClick={handleScrollDownClick}
    />
  );
};
