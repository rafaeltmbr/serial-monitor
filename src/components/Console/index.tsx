import React, { useEffect, useRef, useState } from "react";
import { defaultBaudRate } from "../../config/baud";

import { ILog, LogType } from "../../interfaces/Log/ILog";
import { filterLogAndCount } from "../../util/filterLogAndCount";
import { ConnectDeviceMessage } from "./components/ConnectDeviceMessage";
import { Header } from "./components/Header";
import { Log } from "./components/Log";
import { ManagementBar } from "./components/ManagementBar";
import { NoResultsMessage } from "./components/NoResultsMessage";

import { Container, LogContainer } from "./styles";

interface IProps {
  logs: ILog[];
  onClearLogs: () => void;
}

export const Console: React.FC<IProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();
  const [deviceInfo, setDeviceInfo] = useState("");
  const [baud, setBaud] = useState(defaultBaudRate);
  const logsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ref = logsRef.current;
    if (!ref) return;

    ref.scrollTo({ left: 0, top: ref.scrollHeight, behavior: "smooth" });
  }, [search, selectedType]);

  const [filteredLogs, logTypesCount] = filterLogAndCount(
    logs,
    search,
    selectedType
  );

  const handleSearchClear = () => {
    setSearch("");
    setSelectedType(undefined);
  };

  const handleClearLogs = () => {
    setSearch("");
    setSelectedType(undefined);
    onClearLogs();
  };

  const handleConnectionRequestChange = (status: boolean) => {
    setDeviceInfo(status ? "Arduino Uno R3 - COM4" : "");
    console.log("connection request changed", status);
  };

  const handleBaudChange = (value: number) => {
    setBaud(value);
    console.log("baud change", value);
  };

  return (
    <Container>
      <ManagementBar
        deviceInfo={deviceInfo}
        onConnectionRequestChange={handleConnectionRequestChange}
        baud={baud}
        onBaudChange={handleBaudChange}
      />
      <Header
        search={search}
        logTypesCount={logTypesCount}
        selectedType={selectedType}
        showClearButton={!search && !selectedType && !!logs.length}
        onSearchChange={setSearch}
        onSelectedTypeChange={setSelectedType}
        onSearchClear={handleSearchClear}
        onClearLogs={handleClearLogs}
      />
      {search && !filteredLogs.length ? (
        <NoResultsMessage />
      ) : (
        <LogContainer ref={logsRef} data-child-full-size={!filteredLogs.length}>
          {filteredLogs.map((log, index, allLogs) => (
            <Log
              {...log}
              key={log.id}
              isFirstOfType={!(allLogs[index - 1]?.type === log.type)}
            />
          ))}
          <ConnectDeviceMessage
            show={!(search || selectedType) && !deviceInfo}
            onConnectionRequest={() => handleConnectionRequestChange(true)}
          />
        </LogContainer>
      )}
    </Container>
  );
};
