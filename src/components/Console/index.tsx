import React, { useState } from "react";
import { defaultBaudRate } from "../../config/baud";

import { ILog, LogType } from "../../interfaces/Log/ILog";
import { filterLogAndCount } from "../../util/filterLogAndCount";
import { Header } from "./components/Header";
import { Log } from "./components/Log";
import { ManagementBar } from "./components/ManagementBar";

import { Container, LogContainer } from "./styles";

interface IProps {
  logs: ILog[];
  onClearLogs: () => void;
}

export const Console: React.FC<IProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();
  const [deviceInfo, setDeviceInfo] = useState("no connected device");
  const [isConnected, setIsConnected] = useState(false);
  const [baud, setBaud] = useState(defaultBaudRate);

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
    setIsConnected(status);
    setDeviceInfo(status ? "Arduino Uno R3 - COM4" : "no connected device");
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
        isConnected={isConnected}
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
      <LogContainer>
        {filteredLogs.map((log, index, allLogs) => (
          <Log
            {...log}
            key={log.id}
            isFirstOfType={!(allLogs[index - 1]?.type === log.type)}
          />
        ))}
      </LogContainer>
    </Container>
  );
};
