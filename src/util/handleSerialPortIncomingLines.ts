import { getSerialReader } from "./getSerialReader";

export const handleSerialIncomingLines = async (
  port: SerialPort,
  options: SerialOptions,
  callback: (error: Error | null, line: string) => boolean | void
) => {
  const read = async () => {
    try {
      const reader = await getSerialReader(port, options);

      let strBuffer = "";

      while (true) {
        const { value } = await reader.read();

        strBuffer += new TextDecoder().decode(value);

        if (strBuffer.indexOf("\n") >= 0) {
          const messages = strBuffer.split("\n");

          const m = messages.slice(0, -1);

          for (let i = 0, len = m.length; i < len; i += 1)
            if (callback(null, m[i]) === false) return;

          strBuffer = messages.pop() || "";
        }
      }
    } catch (err) {
      callback(err as Error, "");
    }
  };

  read();
};
