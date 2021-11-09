import { EventEmitter } from "events";

export const serialConnectionStatus = <const>[
  "disconnected",
  "connected", // granted access
  "opened",
  "closing",
  "disconnecting",
];

export type SerialConnectionStatus = typeof serialConnectionStatus[number];

export class SerialConnection extends EventEmitter {
  private port: SerialPort | null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null;
  private status: SerialConnectionStatus;

  constructor() {
    super();

    this.port = null;
    this.reader = null;
    this.status = "disconnected";
  }

  public async connect(options: SerialOptions) {
    const reused = await this.createOrResetConnection();

    this.reader = await this.getSerialReader(options);

    this.handleSerialReading();

    this.emit("connect", reused);
  }

  public async disconnect() {
    await this.stopReading(true);
  }

  private resetInternalState() {
    this.port = null;
    this.reader = null;
    this.status = "disconnected";
  }

  private async stopReading(disconnect?: boolean) {
    if (
      this.status === "disconnected" ||
      (this.status === "connected" && !disconnect)
    )
      return;

    if (this.status === "connected") return await this.closeSerialPort();

    const promise = new Promise<void>((resolve, reject) => {
      if (!this.port) return resolve();

      this.status = disconnect ? "disconnecting" : "closing";

      const handleDisconnect = () => {
        this.removeListener("disconnect", handleDisconnect);
        resolve();
      };

      this.addListener("disconnect", handleDisconnect);

      const handleError = (error: Error) => {
        this.removeListener("error", handleError);
        reject(error);
      };

      this.addListener("error", handleError);
    });

    return promise;
  }

  private async closeSerialPort() {
    if (this.status === "disconnected" || !this.port) return;

    await this.port?.close();
    this.resetInternalState();
  }

  private async createOrResetConnection() {
    if (this.status === "opened") {
      await this.stopReading();
      await this.port?.close();
      this.status = "connected";

      return true;
    }

    if (this.port) await this.port.close();

    this.port = await this.getSerialPort();
    this.status = "connected";

    return false;
  }

  private async getSerialPort() {
    if (!navigator.serial) throw new Error("Serial API not supported");

    return await navigator.serial.requestPort();
  }

  private async getSerialReader(options: SerialOptions) {
    try {
      if (!this.port) return null;

      await this.port.open(options);

      const reader = this.port.readable?.getReader();

      if (!reader) throw new Error("Device can't be read");

      this.status = "opened";

      return reader;
    } catch (err) {
      this.resetInternalState();
      throw err;
    }
  }

  private async handleSerialReading() {
    try {
      if (!this.port || !this.reader)
        throw new Error("Unable to read the serial port");

      let strBuffer = "";

      while (this.status === "opened") {
        const { value } = await this.reader.read();

        strBuffer += new TextDecoder().decode(value);

        const messages = strBuffer.split("\n");

        this.emit("chunk", messages[0]);

        if (strBuffer.indexOf("\n") >= 0) {
          messages.slice(0, -1).forEach((msg) => this.emit("line", msg));

          strBuffer = messages.pop() || "";
        }
      }

      this.reader.releaseLock();
    } catch (err) {
      this.resetInternalState();
      this.emit("error", err);
    } finally {
      if (this.status === "closing") this.status = "connected";
      else if (this.status === "disconnecting") await this.closeSerialPort();

      this.emit("disconnect", this.status);
    }
  }
}
