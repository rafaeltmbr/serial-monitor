import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { IconType } from "react-icons/lib";
import { MdCancel } from "react-icons/md";

import { ILog, LogType } from "../../../../interfaces/Log/ILog";
import { formatLogTimestamp } from "../../../../util/formatLogTimestamp";

import { Container, Content, IConContainer, Timestamp } from "./styles";

interface IProps extends ILog {
  isFirstOfType: boolean;
}

const iconMapping: Record<LogType, IconType | null> = {
  log: null,
  warn: AiFillWarning,
  error: MdCancel,
  command: null,
  send: null,
  info: null,
};

export const Log: React.FC<IProps> = ({
  type,
  content,
  timestamp,
  isFirstOfType,
}) => {
  const Icon = iconMapping[type];

  return (
    <Container data-type={type} data-first-of-type={isFirstOfType}>
      {Icon && (
        <IConContainer>
          <Icon />
        </IConContainer>
      )}
      <Content>{content}</Content>
      <Timestamp>{formatLogTimestamp(timestamp)}</Timestamp>
    </Container>
  );
};
