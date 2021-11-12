import React, { memo, MutableRefObject } from "react";

import {
  ILog,
  ILogCountByType,
  LogType,
} from "../../../../interfaces/Log/ILog";
import { ConnectDeviceMessage } from "../ConnectDeviceMessage";
import { Header } from "../Header";
import { Log } from "../Log";
import { ManagementBar } from "../ManagementBar";
import { NoResultsMessage } from "../NoResultsMessage";

import { Container, LogContainer } from "./styles";

interface IProps {
  search: string;
  logTypesCount: ILogCountByType;
  selectedType?: LogType;
  logs: ILog[];
  baud: number;
  deviceInfo: string;
  logsContainerRef?: MutableRefObject<Element | undefined>;
  onSearch: (search: string) => void;
  onSelectedType: (selectedType?: LogType) => void;
  onClearLogs: () => void;
  onBaudChange: (baud: number) => void;
  onConnectionRequestChange: (status: boolean) => void;
}

export const ConsoleLayout: React.FC<IProps> = memo(
  ({
    search,
    selectedType,
    logs,
    baud,
    deviceInfo,
    logsContainerRef,
    logTypesCount,
    onSearch,
    onSelectedType,
    onClearLogs,
    onBaudChange,
    onConnectionRequestChange,
  }) => {
    const handleSearchClear = () => {
      onSearch("");
      onSelectedType(undefined);
    };

    const handleClearLogs = () => {
      onSearch("");
      onSelectedType(undefined);
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
          onSearchChange={onSearch}
          onSelectedTypeChange={onSelectedType}
          onSearchClear={handleSearchClear}
          onClearLogs={handleClearLogs}
        />
        {search && !logs.length ? (
          <NoResultsMessage />
        ) : (
          <LogContainer
            ref={logsContainerRef as any}
            data-child-full-size={!logs.length}
          >
            {logs.map((log, index, allLogs) => (
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
  }
);
