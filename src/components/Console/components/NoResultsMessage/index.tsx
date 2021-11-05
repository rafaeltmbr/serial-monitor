import React from "react";
import { MdOutlineSpeakerNotesOff } from "react-icons/md";
import {
  Container,
  Content,
  Icon,
  Message,
} from "./styles";

export const NoResultsMessage: React.FC = () => (
  <Container>
    <Content>
      <Icon>
        <MdOutlineSpeakerNotesOff />
      </Icon>
      <Message>Nothing found</Message>
    </Content>
  </Container>
);
