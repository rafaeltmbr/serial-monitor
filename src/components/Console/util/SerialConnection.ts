import { EventEmitter } from "events";

export const serialConnectionStatus = <const>[
  "disconnected",
  "connected", // granted access
  "opened",
  "closing",
  "disconnecting",
];

export type SerialConnectionStatus = typeof serialConnectionStatus[number];

const DEFAULT_MAXIMUM_CHUNK_LENGTH = 256;
export class SerialConnection extends EventEmitter {
  private maxChunkLength: number;
  private port: SerialPort | null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null;
  private status: SerialConnectionStatus;

  constructor(maxChunkLength?: number) {
    super();

    this.maxChunkLength = maxChunkLength || DEFAULT_MAXIMUM_CHUNK_LENGTH;
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

    this.status = disconnect ? "disconnecting" : "closing";

    await this.reader?.cancel();
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

        if (!strBuffer) continue;

        const messages = strBuffer.split("\n");

        this.emit("chunk", messages[0]);

        if (strBuffer.indexOf("\n") >= 0) {
          messages.slice(0, -1).forEach((msg) => this.emit("line", msg));

          strBuffer = messages.pop() || "";
        } else if (strBuffer.length > this.maxChunkLength) {
          this.emit("line", strBuffer);
          strBuffer = "";
        }
      }

      this.reader.releaseLock();
    } catch {
      this.resetInternalState();
    } finally {
      if (this.status === "closing") this.status = "connected";
      else if (this.status === "disconnecting") await this.closeSerialPort();

      this.emit("disconnect", this.status);
    }
  }
}
