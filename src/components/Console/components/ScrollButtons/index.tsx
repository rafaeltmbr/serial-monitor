import React from "react";
import { ScrollButton } from "../ScrollButton";

import { Container } from "./styles";

interface IProps {
  showScrollTop: boolean;
  showScrollDown: boolean;
  onScrollTop: () => void;
  onScrollDown: () => void;
}

export const ScrollButtons: React.FC<IProps> = ({
  showScrollTop,
  showScrollDown,
  onScrollTop,
  onScrollDown,
}) => (
  <Container>
    <ScrollButton show={showScrollTop} onClick={onScrollTop} title="Top" top />
    <ScrollButton show={showScrollDown} onClick={onScrollDown} title="Bottom" />
  </Container>
);
