import React, { useEffect, useState } from "react";
import { Console } from "../../components/Console";
import { defaultBaudRate } from "../../config/baud";
import { ILog } from "../../interfaces/Log/ILog";
import { getSerialPort } from "../../util/getSerialPort";
import { getSerialReader } from "../../util/getSerialReader";

import { Container } from "./styles";

interface IConnection {
  port?: SerialPort;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
  isConnected?: boolean;
}

export const Home: React.FC = () => {
  const [logs, setLogs] = useState<ILog[]>([]);
  const [baud, setBaud] = useState(defaultBaudRate);
  const [readyToConnect, setReadyToConnect] = useState(false);
  const [connection, setConnection] = useState<IConnection>({});

  useEffect(() => {
    const { port } = connection;
    if (!port) return;

    const HandleDisconnect = () => {
      setReadyToConnect(false);
      setConnection({});
    };

    port.addEventListener("disconnect", HandleDisconnect);

    return () => port.removeEventListener("disconnect", HandleDisconnect);
  }, [connection]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleBaudRateChange = (value: number) => {
    setBaud(value);
  };

  useEffect(() => {
    let closed = false;

    const connect = async () => {
      try {
        const port = await getSerialPort();
        const reader = await getSerialReader(port, { baudRate: baud });

        setConnection({ port, reader, isConnected: true });

        let strBuffer = "";

        while (true) {
          if (closed) {
            setConnection((d) => ({ ...d, isConnected: false }));
            setReadyToConnect(false);
            reader.releaseLock();
            port.close();
            return;
          }

          const { value } = await reader.read();

          strBuffer += new TextDecoder().decode(value);

          if (strBuffer.indexOf("\n") >= 0) {
            const messages = strBuffer.split("\n");

            messages.slice(0, -1).forEach((msg) => {
              setLogs((d) => [
                ...d,
                {
                  id: d.length + 1,
                  content: msg,
                  type: "log",
                  timestamp: new Date(),
                },
              ]);
            });

            strBuffer = messages.pop() || "";
          }
        }
      } catch (err) {
        setReadyToConnect(false);
        setConnection({});
      }
    };

    if (readyToConnect) connect();

    return () => {
      closed = true;
    };
  }, [readyToConnect, baud]);

  return (
    <Container>
      <Console
        logs={logs}
        baud={baud}
        onBaudChange={handleBaudRateChange}
        deviceInfo={connection.isConnected ? "Connected" : ""}
        onClearLogs={handleClearLogs}
        onConnectionRequestChange={setReadyToConnect}
      />
    </Container>
  );
};
