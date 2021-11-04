import React, { HTMLAttributes } from "react";
import {
  ILogCountByType,
  LogType,
  logTypes,
} from "../../../../interfaces/Log/ILog";
import { LogTypeButton } from "../LogTypeButton";

import { SearchInput } from "../SearchInput";

import { LogTypesContainer, Container } from "./styles";

interface IProps extends HTMLAttributes<HTMLElement> {
  search: string;
  selectedType: LogType | undefined;
  logTypesCount: ILogCountByType;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSelectedTypeChange: (type: LogType | undefined) => void;
}

export const Header: React.FC<IProps> = ({
  search,
  onSearchChange,
  logTypesCount,
  selectedType,
  onSelectedTypeChange,
  onSearchClear,
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
  </Container>
);
