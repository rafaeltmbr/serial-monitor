import React, { useEffect, useRef, useState } from "react";

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
  baud: number;
  deviceInfo: string;
  onClearLogs: () => void;
  onBaudChange: (baud: number) => void;
  onConnectionRequestChange: (status: boolean) => void;
}

export const Console: React.FC<IProps> = ({
  logs,
  baud,
  deviceInfo,
  onClearLogs,
  onBaudChange,
  onConnectionRequestChange,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();
  const logsRef = useRef<HTMLUListElement>(null);

  const [filteredLogs, logTypesCount] = filterLogAndCount(
    logs,
    search,
    selectedType
  );

  useEffect(() => {
    const ref = logsRef.current;
    if (!ref) return;

    ref.scrollTo(0, ref.scrollHeight);
  }, [filteredLogs]);

  const handleSearchClear = () => {
    setSearch("");
    setSelectedType(undefined);
  };

  const handleClearLogs = () => {
    setSearch("");
    setSelectedType(undefined);
    onClearLogs();
  };

  return (
    <Container>
      <ManagementBar
        deviceInfo={deviceInfo}
        onConnectionRequestChange={onConnectionRequestChange}
        baud={baud}
        onBaudChange={onBaudChange}
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
            onConnectionRequest={() => onConnectionRequestChange(true)}
          />
        </LogContainer>
      )}
    </Container>
  );
};
