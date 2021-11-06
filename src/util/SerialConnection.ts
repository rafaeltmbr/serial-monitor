import { EventEmitter } from "events";

export const serialConnectionStatus = <const>[
  "disconnected",
  "connected",
  "reading",
  "stop_reading",
];

export type SerialConnectionStatus = typeof serialConnectionStatus[number];

export class SerialConnection extends EventEmitter {
  private port: SerialPort | null;
  private status: SerialConnectionStatus;

  constructor() {
    super();

    this.port = null;
    this.status = "disconnected";
  }

  public async connect(options: SerialOptions) {
    await this.createOrReuseSerialPort();

    this.handleSerialReading(options);
  }

  public async disconnect() {
    if (this.status === "disconnected" || this.status === "connected") return;

    const promise = new Promise<void>((resolve, reject) => {
      if (!this.port) return resolve();

      this.status = "stop_reading";

      this.addListener("disconnect", resolve);

      this.addListener("error", reject);
    });

    return promise;
  }

  private async createOrReuseSerialPort() {
    if (this.status === "reading") {
      await this.disconnect();
      await this.port?.close();
      this.status = "connected";

      return;
    }

    if (this.port) {
      await this.port.close();
    }

    this.port = await this.getSerialPort();
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

  private async handleSerialReading(options: SerialOptions) {
    try {
      if (!this.port) throw new Error("Attempt to read an nonexistent port");

      const reader = await this.getSerialReader(options);
      if (!reader) throw new Error("Unable to open a read stream");

      this.status = "reading";
      let strBuffer = "";

      while (this.status === "reading") {
        const { value } = await reader.read();

        strBuffer += new TextDecoder().decode(value);

        const messages = strBuffer.split("\n");

        this.emit("chunk", messages[0]);

        if (strBuffer.indexOf("\n") >= 0) {
          messages.slice(0, -1).forEach((msg) => this.emit("line", msg));

          strBuffer = messages.pop() || "";
        }
      }

      reader.releaseLock();
      this.status = "connected";
    } catch (err) {
      this.emit("error", err);
      this.status = "disconnected";
      this.port = null;
    } finally {
      this.emit("disconnect", this.status);
    }
  }
}
