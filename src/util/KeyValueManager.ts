import { EventEmitter } from "events";

type DataCallback<T> = (value: Readonly<T>) => void;

type ValueCallback<T, K extends keyof T> = (
  value: Readonly<T[K]>,
  key: K
) => void;

type MixedSetArgs<T, K extends keyof T> = [T] | [K, T[K]];

type MixedListenerArgs<T, K extends keyof T> =
  | [DataCallback<T>]
  | [K, ValueCallback<T, K>];

const ALL_KEYS_SYMBOL = "__KEY_VALUE_MANAGER_ALL_KEYS_SYMBOL";

export class KeyValueManager<T> extends EventEmitter {
  constructor(private data: T) {
    super();

    if (typeof data !== "object") throw new Error("Data must be an object.");

    if (Object.keys(data).includes(ALL_KEYS_SYMBOL))
      throw new Error(`${ALL_KEYS_SYMBOL} is an exclusive object key.`);
  }

  public get(): Readonly<T>;
  public get<K extends keyof T>(key: K): Readonly<T[K]>;
  public get<K extends keyof T>(key?: K): Readonly<T> | Readonly<T[K]> {
    return key === undefined ? this.data : this.data[key];
  }

  public set(value: T): this;
  public set<K extends keyof T>(key: K, value: T[K]): this;
  public set<K extends keyof T>(...args: MixedSetArgs<T, K>) {
    if (args.length === 1) this.data = args[0];
    else {
      this.data[args[0]] = args[1];
      this.emit(args[0].toString(), args[1], args[0]);
    }

    this.emit(ALL_KEYS_SYMBOL, this.data);

    return this;
  }

  public addChangeListener(callback: DataCallback<T>): this;
  public addChangeListener<K extends keyof T>(
    key: K,
    callback: ValueCallback<T, K>
  ): this;
  public addChangeListener<K extends keyof T>(
    ...args: MixedListenerArgs<T, K>
  ) {
    if (args.length === 1) this.addListener(ALL_KEYS_SYMBOL, args[0]);
    else this.addListener(args[0].toString(), args[1]);

    return this;
  }

  public removeChangeListener(callback: DataCallback<T>): this;
  public removeChangeListener<K extends keyof T>(
    key: K,
    callback: ValueCallback<T, K>
  ): this;
  public removeChangeListener<K extends keyof T>(
    ...args: MixedListenerArgs<T, K>
  ) {
    if (args.length === 1) this.removeListener(ALL_KEYS_SYMBOL, args[0]);
    else this.removeListener(args[0].toString(), args[1]);

    return this;
  }
}
