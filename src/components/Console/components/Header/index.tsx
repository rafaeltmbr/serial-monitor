import React, { HTMLAttributes } from "react";
import {
  ILogCountByType,
  LogType,
  logTypes,
} from "../../../../interfaces/Log/ILog";
import { ClearButton } from "../ClearButton";
import { LogTypeButton } from "../LogTypeButton";

import { SearchInput } from "../SearchInput";
import { SearchMessage } from "../SearchMessage";

import { LogTypesContainer, Container } from "./styles";

interface IProps extends HTMLAttributes<HTMLElement> {
  search: string;
  selectedType: LogType | undefined;
  logTypesCount: ILogCountByType;
  showClearButton: boolean;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSelectedTypeChange: (type: LogType | undefined) => void;
  onClearLogs: () => void;
}

export const Header: React.FC<IProps> = ({
  search,
  selectedType,
  logTypesCount,
  showClearButton,
  onSearchChange,
  onSearchClear,
  onSelectedTypeChange,
  onClearLogs,
  ...rest
}) => (
  <Container {...rest}>
    <SearchInput
      value={search}
      onChange={onSearchChange}
      onClear={onSearchClear}
    />
    <LogTypesContainer>
      {logTypes.map((key) => (
        <LogTypeButton
          key={key}
          type={key}
          count={logTypesCount[key]}
          selected={selectedType === key}
          onSelectChange={onSelectedTypeChange}
        />
      ))}
    </LogTypesContainer>
    {showClearButton ? <ClearButton onClick={onClearLogs} /> : null}
    {search || selectedType ? (
      <SearchMessage search={search} selectedType={selectedType} />
    ) : null}
  </Container>
);
