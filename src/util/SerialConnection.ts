import { EventEmitter } from "events";

export class SerialConnection extends EventEmitter {
  private port: SerialPort | null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null;
  private disconnecting: boolean;

  constructor() {
    super();

    this.port = null;
    this.reader = null;
    this.disconnecting = false;
  }

  public async connect(options: SerialOptions) {
    if (!this.port) {
      this.port = await this.getSerialPort();

      this.port.addEventListener(
        "disconnect",
        this.handlePortDisconnect.bind(this)
      );
    }

    this.reader = await this.getSerialReader(options);

    this.disconnecting = false;
    this.handleSerialReading();
  }

  public async disconnect() {
    this.disconnecting = true;
  }

  private async getSerialPort() {
    if (!navigator.serial) throw new Error("Serial API not supported!");

    return await navigator.serial.requestPort();
  }

  private async getSerialReader(options: SerialOptions) {
    if (!this.port) return null;

    await this.port.open(options);

    const reader = this.port.readable?.getReader();

    if (!reader) throw new Error("Device can' be read");

    return reader;
  }

  private async handleSerialReading() {
    if (!this.port || !this.reader) return;

    try {
      let strBuffer = "";

      while (!this.disconnecting) {
        const { value } = await this.reader.read();

        strBuffer += new TextDecoder().decode(value);

        if (strBuffer.indexOf("\n") >= 0) {
          const messages = strBuffer.split("\n");

          messages.slice(0, -1).forEach((msg) => this.emit("line", msg));

          strBuffer = messages.pop() || "";
        }
      }

      this.reader.releaseLock();
      this.port.close();
    } catch (err) {
      this.emit("error", err);
    } finally {
      this.port = null;
      this.disconnecting = false;
      this.emit("disconnect");
    }
  }

  private handlePortDisconnect() {
    this.port = null;
    this.emit("disconnect");
  }
}
