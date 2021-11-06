import { EventEmitter } from "events";

export class SerialConnection extends EventEmitter {
  private port: SerialPort | null;
  private disconnecting: boolean;

  constructor() {
    super();

    this.port = null;
    this.disconnecting = false;
  }

  public async connect(options: SerialOptions) {
    if (this.port) {
      await this.disconnect();
    } else {
      this.port = await this.getSerialPort();

      this.port.addEventListener(
        "disconnect",
        this.handlePortDisconnect.bind(this)
      );
    }

    this.disconnecting = false;
    this.handleSerialReading(options);
  }

  public async disconnect() {
    const promise = new Promise<void>((resolve, reject) => {
      if (!this.port) return resolve();

      this.disconnecting = true;

      this.addListener("disconnect", resolve);

      this.addListener("error", reject);
    });

    return promise;
  }

  public isConnected() {
    return !!this.port;
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

      let strBuffer = "";

      while (!this.disconnecting) {
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
    this.disconnecting = false;
    this.emit("disconnect");
  }
}
