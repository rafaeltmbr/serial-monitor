import React, { useState } from "react";

import { ILog, LogType } from "../../interfaces/Log/ILog";
import { filterLogAndCount } from "../../util/filterLogAndCount";
import { Header } from "./components/Header";
import { Log } from "./components/Log";

import { Container, LogContainer } from "./styles";

interface IProps {
  logs: ILog[];
  onClearLogs: () => void;
}

export const Console: React.FC<IProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LogType | undefined>();

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

  return (
    <Container>
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
