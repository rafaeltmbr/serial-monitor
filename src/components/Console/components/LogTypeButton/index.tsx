import React from "react";
import { IconType } from "react-icons";
import { AiFillWarning } from "react-icons/ai";
import { FaCode, FaReceipt } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

import { LogType } from "../../../../interfaces/Log/ILog";

import { Container, Count } from "./styles";

interface IProps {
  type: LogType;
  count: number;
  selected: boolean;
  onSelectChange: (type: LogType | undefined) => void;
}

const typeIcons: Record<LogType, IconType> = {
  log: FaReceipt,
  warn: AiFillWarning,
  error: MdCancel,
  command: FaCode,
  send: IoMdSend,
};

const typeTitle: Record<LogType, string> = {
  log: "Logs",
  warn: "Warns",
  error: "Errors",
  command: "Commands",
  send: "Sent",
};

export const LogTypeButton: React.FC<IProps> = ({
  type,
  count,
  selected,
  onSelectChange,
}) => {
  if (!count && !selected) return null;

  const Icon = typeIcons[type];

  const handleClick = () => {
    onSelectChange(selected ? undefined : type);
  };

  return (
    <Container
      data-type={type}
      data-selected={!!selected}
      onClick={handleClick}
      title={typeTitle[type]}
    >
      <Icon />
      <Count>{count}</Count>
    </Container>
  );
};
