import React, { HTMLAttributes } from "react";
import { CgSearch } from "react-icons/cg";

import { Container, IconContainer, Input } from "./styles";

interface IProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<IProps> = ({ value, onChange, ...rest }) => {
  return (
    <Container {...rest}>
      <Input
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <IconContainer>
        <CgSearch />
      </IconContainer>
    </Container>
  );
};
