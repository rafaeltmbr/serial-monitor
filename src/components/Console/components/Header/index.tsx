import React, { HTMLAttributes } from "react";

import { SearchInput } from "../SearchInput";

import { Container } from "./styles";

interface IProps extends HTMLAttributes<HTMLElement> {
  search: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<IProps> = ({
  search,
  onSearchChange,
  ...rest
}) => {
  return (
    <Container {...rest}>
      <SearchInput value={search} onChange={onSearchChange} />
    </Container>
  );
};
