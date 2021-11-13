import React, { HTMLAttributes } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";

import { Button } from "./styles";

interface IProps extends HTMLAttributes<HTMLElement> {
  show: boolean;
  top?: boolean;
  onClick: () => void;
}

export const ScrollButton: React.FC<IProps> = ({ show, top, ...rest }) => (
  <Button {...rest} data-show={show} data-top={!!top}>
    <MdOutlineArrowBackIosNew />
  </Button>
);
