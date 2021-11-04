import React, { useState } from "react";

import { ILog } from "../../interfaces/Log/ILog";
import { containString } from "../../util/containString";
import { Header } from "./components/Header";
import { Log } from "./components/Log";

import { Container, LogContainer } from "./styles";

interface IProps {
  logs: ILog[];
}

export const Console: React.FC<IProps> = ({ logs }) => {
  const [search, setSearch] = useState("");

  return (
    <Container>
      <Header search={search} onSearchChange={setSearch} />
      <LogContainer>
        {logs
          .filter((log) => containString({ source: log.content, search }))
          .map((log, index, allLogs) => (
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
