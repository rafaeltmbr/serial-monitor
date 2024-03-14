import React from "react";

import { Container, Input, SearchIconContainer } from "./styles";
import { IoMdSend } from "react-icons/io";

interface IProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: (message: string) => void;
}

export const SendMessage: React.FC<IProps> = ({
  message,
  onMessageChange,
  onSend,
  ...rest
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSend(`${message}\n`);
  };

  return (
    <Container {...rest}>
      <Input
        placeholder="Send"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <SearchIconContainer>
        <IoMdSend title="Enviar" onClick={() => onSend(message)} />
      </SearchIconContainer>
    </Container>
  );
};
