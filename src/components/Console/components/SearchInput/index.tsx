import React, { HTMLAttributes } from "react";
import { CgSearch } from "react-icons/cg";
import { MdClose } from "react-icons/md";

import {
  Container,
  SearchIconContainer,
  Input,
  ClearIconContainer,
} from "./styles";

interface IProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const SearchInput: React.FC<IProps> = ({
  value,
  onChange,
  onClear,
  ...rest
}) => {
  return (
    <Container {...rest}>
      <Input
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <SearchIconContainer>
        <CgSearch />
      </SearchIconContainer>
      {value ? (
        <ClearIconContainer title="Clear" onClick={() => onClear()}>
          <MdClose />
        </ClearIconContainer>
      ) : null}
    </Container>
  );
};
