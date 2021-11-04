import React from "react";
import { ILog } from "../../interfaces/Log/ILog";
import { Log } from "./components/Log";

import { Container, LogContainer } from "./styles";

interface IProps {
  logs: ILog[];
}

export const Console: React.FC<IProps> = ({ logs }) => {
  return (
    <Container>
      <LogContainer>
        {logs.map((log, index, allLogs) => (
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
