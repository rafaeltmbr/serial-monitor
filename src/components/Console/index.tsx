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

type State = typeof initialState;

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
    kvm.set({
      ...kvm.get(),
      page: WINDOW_PAGES_SIZE,
      autoScroll: true,
      logs: [],
      showScrollTopButton: false,
      showScrollDownButton: false,
    });
    setRenderId((id) => id + 1);
  }, [kvm]);

  const handleBaudRateChange = useCallback(
    (value: number) => kvm.set("baud", value),
    [kvm]
  );

  const handleSerialChunk = useCallback(
    (content: string | null) =>
      kvm.set("logChunk", content ? makeLog("log", content) : null),
    [kvm]
  );

  const pushNewLogLine = useCallback(
    (log: ILog) => {
      kvm.set("logChunk", null);
      kvm.set("logs", [...kvm.get("logs"), log]);
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
      kvm.set("logChunk", null);
      kvm.set("isConnected", false);
      kvm.set("autoScroll", true);

      if (status === "disconnected") kvm.set("readyToConnect", false);
    },
    [kvm, pushNewLogLine]
  );

  useEffect(() => {
    const handleIsConnectedChange = ({ isConnected }: State) => {
      kvm.set("autoScroll", isConnected);
    };

    kvm.addChangeListener("isConnected", handleIsConnectedChange);

    return () => {
      kvm.removeChangeListener("isConnected", handleIsConnectedChange);
    };
  }, [kvm]);

  useEffect(() => {
    const handleFilterChange = () => kvm.set("page", WINDOW_PAGES_SIZE);

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
    const handleConnectionChange = async ({ readyToConnect, baud }: State) => {
      try {
        if (!readyToConnect) return;

        await serial.connect({ baudRate: baud });
      } catch (err: unknown) {
        pushNewLogLine(makeLog("info", (err as Error).message));

        kvm.set("readyToConnect", false);
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
    const handleReadyToConnect = async ({ readyToConnect }: State) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kvm, renderId]);

  const pages = Math.max(
    Math.ceil(filteredLogs.length / LOG_PAGE_SIZE),
    WINDOW_PAGES_SIZE
  );

  const lastPage = Math.max(pages, WINDOW_PAGES_SIZE);

  if (kvm.get("autoScroll")) kvm.set("page", lastPage);

  const logsSlice = useMemo(() => {
    const pageStart = (kvm.get("page") - WINDOW_PAGES_SIZE) * LOG_PAGE_SIZE;
    const pageEnd = pageStart + WINDOW_PAGES_SIZE * LOG_PAGE_SIZE;

    const logsSlice = filteredLogs.slice(pageStart, pageEnd);

    return logsSlice;
  }, [kvm, filteredLogs]);

  useEffect(() => {
    const handleAutoScrollChange = ({ autoScroll }: State) => {
      if (autoScroll) kvm.set("page", lastPage);
    };

    kvm.addChangeListener("autoScroll", handleAutoScrollChange);

    return () => {
      kvm.removeChangeListener("autoScroll", handleAutoScrollChange);
    };
  }, [kvm, lastPage]);

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

      if (page === lastPage) {
        kvm.set("autoScroll", true);
        kvm.set("showScrollDownButton", false);
      }
    },
    [lastPage],
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
      kvm.set("showScrollTopButton", false);
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

  const handleSearch = useCallback(
    (value: string) => {
      kvm.set("search", value);
      setRenderId((id) => id + 1);
    },
    [kvm]
  );

  const handleSelectedType = useCallback(
    (value: LogType | undefined) => {
      kvm.set("selectedType", value);
      setRenderId((id) => id + 1);
    },
    [kvm]
  );

  const handleReadyToConnect = useCallback(
    (value: boolean) => kvm.set("readyToConnect", value),
    [kvm]
  );

  useEffect(() => {
    detectUserScroll.current = true;

    if (kvm.get("autoScroll"))
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [kvm, renderId]);

  detectUserScroll.current = false;

  console.log(`${kvm.get("page")} / ${pages}`);

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

  useRenderCount((count) => console.log(`UI Render: ${count}`));

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
