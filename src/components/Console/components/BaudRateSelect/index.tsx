import React, { useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { BsCheck2 } from "react-icons/bs";

import { baudRates } from "../../../../config/baud";

import {
  ArrowDown,
  Container,
  Label,
  Option,
  OptionIcon,
  OptionsList,
  OptionsListWrapper,
  OptionsMask,
  OptionText,
} from "./styles";

interface IProps {
  baud: number;
  onBaudChange: (baud: number) => void;
}

export const BaudRateSelect: React.FC<IProps> = ({ baud, onBaudChange }) => {
  const [showOptions, setShowOptions] = useState(false);
  const maskRef = useRef<HTMLDivElement>(null);

  const handleMaskClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (e.target === maskRef.current) setShowOptions(false);
  };

  const handleOptionClick = (rate: number) => {
    onBaudChange(rate);
    setShowOptions(false);
  };

  return (
    <Container onClick={() => setShowOptions(true)}>
      <Label>{baud} baud</Label>
      <ArrowDown data-rotate={showOptions}>
        <IoIosArrowDown />
      </ArrowDown>
      <OptionsMask
        data-show={showOptions}
        onClick={handleMaskClick}
        ref={maskRef}
      >
        <OptionsListWrapper>
          <OptionsList>
            {baudRates.map((rate) => (
              <Option key={rate} onClick={() => handleOptionClick(rate)}>
                <OptionIcon data-selected={rate === baud}>
                  <BsCheck2 />
                </OptionIcon>
                <OptionText>{rate}</OptionText>
              </Option>
            ))}
          </OptionsList>
        </OptionsListWrapper>
      </OptionsMask>
    </Container>
  );
};
