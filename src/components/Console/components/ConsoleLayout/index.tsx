import React, { MutableRefObject, useState } from "react";

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
import { ScrollButtons } from "../ScrollButtons";

import {
  Container,
  LogContainer,
  LogsAndScrollButtonsContainer,
} from "./styles";
import { SendMessage } from "../SendMessage";

interface IProps {
  logTypesCount: ILogCountByType;
  logs: ILog[];
  logChunk: ILog | null;
  baud: number;
  deviceInfo: string;
  logsContainerRef?: MutableRefObject<Element | undefined>;
  showScrollTopButton: boolean;
  showScrollDownButton: boolean;
  sendMessage: string;
  onSearch: (search: string) => void;
  onSelectedType: (selectedType?: LogType) => void;
  onClearLogs: () => void;
  onBaudChange: (baud: number) => void;
  onConnectionRequestChange: (status: boolean) => void;
  onScrollTopClick: () => void;
  onScrollDownClick: () => void;
  onMessageChange: (message: string) => void;
  onSendMessage: (message: string) => void;
}

export const ConsoleLayout: React.FC<IProps> = ({
  logs,
  logChunk,
  baud,
  deviceInfo,
  logsContainerRef,
  logTypesCount,
  showScrollTopButton,
  showScrollDownButton,
  sendMessage,
  onSearch,
  onSelectedType,
  onClearLogs,
  onBaudChange,
  onConnectionRequestChange,
  onScrollTopClick,
  onScrollDownClick,
  onMessageChange,
  onSendMessage,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();

  const handleSearchClear = () => {
    handleSearchChange("");
    handleSelectedTypeChange(undefined);
  };

  const handleClearLogs = () => {
    handleSearchChange("");
    handleSelectedTypeChange(undefined);
    onClearLogs();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleSelectedTypeChange = (value: LogType | undefined) => {
    setSelectedType(value);
    onSelectedType(value);
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
        onSearchChange={handleSearchChange}
        onSelectedTypeChange={handleSelectedTypeChange}
        onSearchClear={handleSearchClear}
        onClearLogs={handleClearLogs}
      />
      {search && !logs.length ? (
        <NoResultsMessage />
      ) : (
        <LogsAndScrollButtonsContainer>
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
            {logChunk && (
              <Log
                {...logChunk}
                key={logChunk.id}
                isFirstOfType={!(logs[logs.length - 1]?.type === logChunk.type)}
              />
            )}
            <ConnectDeviceMessage
              show={!(search || selectedType) && !deviceInfo}
              onConnectionRequest={() => onConnectionRequestChange(true)}
            />
          </LogContainer>
          <ScrollButtons
            showScrollTop={showScrollTopButton}
            showScrollDown={showScrollDownButton}
            onScrollTop={onScrollTopClick}
            onScrollDown={onScrollDownClick}
          />
        </LogsAndScrollButtonsContainer>
      )}
      {!!deviceInfo && (
        <SendMessage
          message={sendMessage}
          onMessageChange={onMessageChange}
          onSend={onSendMessage}
        />
      )}
    </Container>
  );
};
