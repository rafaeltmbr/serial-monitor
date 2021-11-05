import React, { useState } from "react";
import { Console } from "../../components/Console";
import { ILog } from "../../interfaces/Log/ILog";

import { Container } from "./styles";

const defaultLogs: ILog[] = [
  {
    id: 1,
    type: "log",
    content: "Temperature: 28°C    Humidity: 60%",
    timestamp: new Date(),
  },
  {
    id: 2,
    type: "log",
    content: "Temperature: 29°C    Humidity: 61%",
    timestamp: new Date(),
  },
  {
    id: 3,
    type: "warn",
    content:
      "Something may be wrong. Temperature cannot be read properly. Checkout the hardware connections.",
    timestamp: new Date(),
  },
  {
    id: 4,
    type: "log",
    content: "Temperature: 28°C    Humidity: 60%",
    timestamp: new Date(),
  },
  {
    id: 5,
    type: "error",
    content: "Unable to read the temperature sensor.",
    timestamp: new Date(),
  },
  {
    id: 6,
    type: "send",
    content: "Turn fan on",
    timestamp: new Date(),
  },
  {
    id: 7,
    type: "log",
    content: "Temperature: 29°C    Humidity: 61%",
    timestamp: new Date(),
  },
  {
    id: 8,
    type: "log",
    content: "Temperature: 30°C    Humidity: 61%",
    timestamp: new Date(),
  },
  {
    id: 9,
    type: "log",
    content: "Temperature: 31°C    Humidity: 62%",
    timestamp: new Date(),
  },
];

export const Home: React.FC = () => {
  const [logs, setLogs] = useState(defaultLogs);

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <Container>
      <Console logs={logs} onClearLogs={handleClearLogs} />
    </Container>
  );
};
