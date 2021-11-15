import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConsoleLayout } from "../../components/Console/components/ConsoleLayout";
import { DEFAULT_BAUD_RATE } from "../../config/baud";
import { useAccumulatorInterval } from "../../hooks/AccumulatorInterval";
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
  // original states
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
  const setRenderId = useState(0)[1];

  const handleClearLogs = useCallback(() => {
    kvm.set({
      ...kvm.get(),
      page: WINDOW_PAGES_SIZE,
      autoScroll: true,
      logs: [],
      showScrollTopButton: false,
      showScrollDownButton: false,
    });
    setRenderId((id) => id + 1);
  }, [kvm, setRenderId]);

  useEffect(() => {
    const descriptor = setInterval(() => {
      setRenderId((id) => id + 1);
    }, RENDER_REFRESH_INTERVAL);

    return () => clearInterval(descriptor);
  }, [setRenderId]);

  const handleBaudRateChange = useCallback(
    (value: number) => kvm.set("baud", value),
    [kvm]
  );

  const pushNewLogChunk = useAccumulatorInterval<string | null>(
    (chunks) => {
      const chunkContent = chunks[chunks.length - 1];

      const chunk = makeLog("log", chunkContent || "");

      kvm.set("logChunk", chunkContent ? chunk : null);
    },
    [kvm],
    RENDER_REFRESH_INTERVAL
  );

  const handleSerialChunk = useCallback(pushNewLogChunk, [pushNewLogChunk]);

  const pushNewLogLine = useAccumulatorInterval<ILog>(
    (accLogs) => {
      pushNewLogChunk(null);
      kvm.set("logs", [...kvm.get("logs"), ...accLogs]);
    },
    [kvm],
    RENDER_REFRESH_INTERVAL
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

      kvm.set("isConnected", true);
    },
    [kvm, pushNewLogLine]
  );

  const handleSerialDisconnect = useCallback(
    async (status: SerialConnectionStatus) => {
      const msg = `Device ${
        status === "disconnected" ? "disconnected" : "port closed"
      }`;
      const disconnectLog: ILog = makeLog("info", msg);

      const chunk = kvm.get("logChunk");

      if (chunk) pushNewLogLine(chunk);

      pushNewLogLine(disconnectLog);
      pushNewLogChunk(null);
      kvm.set("isConnected", true);

      if (status === "disconnected") kvm.set("readyToConnect", false);
    },
    [kvm, pushNewLogChunk, pushNewLogLine]
  );

  useEffect(() => {
    const handleIsConnectedChange = (isConnected: boolean) => {
      kvm.set("autoScroll", isConnected);
    };

    kvm.addChangeListener("isConnected", handleIsConnectedChange);

    return () => {
      kvm.removeChangeListener("isConnected", handleIsConnectedChange);
    };
  }, [kvm]);

  useEffect(() => {
    const handleFilterChange = () => kvm.set("page", WINDOW_PAGES_SIZE);

    kvm.addChangeListener("page", handleFilterChange);
    kvm.addChangeListener("selectedType", handleFilterChange);

    return () => {
      kvm.removeChangeListener("page", handleFilterChange);
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
        const { readyToConnect, baud } = kvm.get();

        if (!readyToConnect) return;

        await serial.connect({ baudRate: baud });
      } catch (err: unknown) {
        pushNewLogLine(makeLog("info", (err as Error).message));

        kvm.set("readyToConnect", false);
      }
    };

    kvm.addChangeListener(handleConnectionChange);

    return () => {
      kvm.removeChangeListener(handleConnectionChange);
    };
  }, [kvm, serial, pushNewLogLine]);

  useEffect(() => {
    const handleReadyToConnect = async (readyToConnect: boolean) => {
      if (!readyToConnect) await serial.disconnect();
    };

    kvm.addChangeListener("readyToConnect", handleReadyToConnect);

    return () => {
      kvm.removeChangeListener("readyToConnect", handleReadyToConnect);
    };
  }, [kvm, serial]);

  const [filteredLogs, logTypesCount] = useMemo(() => {
    const { logs, search, selectedType } = kvm.get();
    return filterLogAndCount(logs, search, selectedType);
  }, [kvm]);

  const pages = Math.max(
    Math.ceil(filteredLogs.length / LOG_PAGE_SIZE),
    WINDOW_PAGES_SIZE
  );

  const currentPage = kvm.get("autoScroll") ? pages : kvm.get("page");

  const logsSlice = useMemo(() => {
    const pageStart = (currentPage - WINDOW_PAGES_SIZE) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + WINDOW_PAGES_SIZE * LOG_PAGE_SIZE;

    const logsSlice = filteredLogs.slice(pageStart, pageEnd);

    detectUserScroll.current = false;

    return logsSlice;
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    const handleAutoScrollChange = (autoScroll: boolean) => {
      if (autoScroll) kvm.set("page", Math.max(pages, WINDOW_PAGES_SIZE));
    };

    kvm.addChangeListener("autoScroll", handleAutoScrollChange);

    return () => {
      kvm.removeChangeListener("autoScroll", handleAutoScrollChange);
    };
  }, [kvm, pages]);

  useScrollThreshold(
    () => {
      const p = kvm.get("page");
      kvm.set("page", p > WINDOW_PAGES_SIZE ? p - 1 : p);
    },
    [],
    scrollRef,
    { offset: { top: { min: 500 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.get("page");
      kvm.set("page", p > WINDOW_PAGES_SIZE ? p - 1 : p);
    },
    [],
    scrollRef,
    { offset: { top: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.get("page");
      kvm.set("page", p < pages ? p + 1 : p);
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 500 } } }
  );

  useScrollThreshold(
    () => {
      const p = kvm.get("page");
      kvm.set("page", p < pages ? p + 1 : p);
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      const page = kvm.get("page");

      if (page === Math.max(pages, WINDOW_PAGES_SIZE)) {
        kvm.set("autoScroll", true);
        kvm.set("showScrollDownButton", false);
      }
    },
    [pages],
    scrollRef,
    { offset: { bottom: { min: 100 } } }
  );

  useScrollThreshold(
    () => {
      if (kvm.get("autoScroll") && detectUserScroll.current)
        kvm.set("autoScroll", false);
    },
    [],
    scrollRef,
    { offset: { bottom: { max: 1 } } }
  );

  useScrollThreshold(
    () => {
      const handleAutoScrollChange = () =>
        kvm.set("showScrollTopButton", false);

      kvm.addChangeListener("autoScroll", handleAutoScrollChange);

      return () => {
        kvm.removeChangeListener("autoScroll", handleAutoScrollChange);
      };
    },
    [],
    scrollRef,
    { offset: { top: { min: 50 } } }
  );

  useScrollDirection(
    (direction) => kvm.set("showScrollTopButton", direction.y < 0),
    [],
    scrollRef
  );

  useScrollDirection(
    (direction) =>
      kvm.set(
        "showScrollDownButton",
        direction.y > 0 && !kvm.get("autoScroll")
      ),
    [],
    scrollRef
  );

  const handleScrollTopClick = useCallback(() => {
    kvm.set({
      ...kvm.get(),
      autoScroll: false,
      page: WINDOW_PAGES_SIZE,
      showScrollTopButton: false,
    });

    scrollRef.current?.scrollTo(0, 0);
  }, [kvm]);

  const handleScrollDownClick = useCallback(() => {
    kvm.set({
      ...kvm.get(),
      autoScroll: true,
      showScrollDownButton: false,
    });
  }, [kvm]);

  useEffect(() => {
    const handleAutoScroll = (autoScroll: boolean) => {
      detectUserScroll.current = true;

      if (autoScroll)
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    };

    kvm.addChangeListener("autoScroll", handleAutoScroll);

    return () => {
      kvm.removeChangeListener("autoScroll", handleAutoScroll);
    };
  }, [kvm]);

  const handleSearch = useCallback(
    (value: string) => {
      kvm.set("search", value);
    },
    [kvm]
  );

  const handleSelectedType = useCallback(
    (value: LogType | undefined) => {
      kvm.set("selectedType", value);
    },
    [kvm]
  );

  const handleReadyToConnect = useCallback(
    (value: boolean) => {
      kvm.set("readyToConnect", value);
    },
    [kvm]
  );

  const {
    search,
    selectedType,
    logChunk,
    baud,
    isConnected,
    showScrollTopButton,
    showScrollDownButton,
  } = kvm.get();

  const isFiltering = search || selectedType;

  return (
    <ConsoleLayout
      search={search}
      selectedType={selectedType}
      logs={logsSlice}
      logChunk={isFiltering ? null : logChunk}
      baud={baud}
      deviceInfo={isConnected ? "Connected" : ""}
      logsContainerRef={scrollRef}
      logTypesCount={logTypesCount}
      showScrollTopButton={showScrollTopButton}
      showScrollDownButton={showScrollDownButton}
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
