import { EventEmitter } from "events";

export class SerialConnection extends EventEmitter {
  private port: SerialPort | null;
  private status: "disconnected" | "disconnecting" | "reading";
  private portDisconnectHandler: () => void;

  constructor() {
    super();

    this.port = null;
    this.status = "disconnected";
    this.portDisconnectHandler = this.handlePortDisconnect.bind(this);
  }

  public async connect(options: SerialOptions) {
    await this.createOrReuseSerialPort();

    this.handleSerialReading(options);
  }

  public async disconnect() {
    if (this.status === "disconnected") return;

    const promise = new Promise<void>((resolve, reject) => {
      if (!this.port) return resolve();

      this.status = "disconnecting";

      this.addListener("disconnect", resolve);

      this.addListener("error", reject);
    });

    return promise;
  }

  private async createOrReuseSerialPort() {
    if (this.status === "reading") {
      await this.disconnect();
      await this.port?.close();
      this.port?.removeEventListener("disconnect", this.portDisconnectHandler);
      this.status = "disconnected";

      return;
    }

    if (this.port) {
      await this.port.close();
      this.port?.removeEventListener("disconnect", this.portDisconnectHandler);
    }

    this.port = await this.getSerialPort();

    this.port.addEventListener("disconnect", this.portDisconnectHandler);
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
    } catch (err) {
      this.emit("error", err);
    } finally {
      this.status = "disconnected";
      this.emit("disconnect");
    }
  }

  private handlePortDisconnect() {
    this.port = null;
    this.status = "disconnected";
    this.emit("disconnect");
  }
}
