export const getSerialPort = async () => {
  if (!navigator.serial) throw new Error("Serial API not supported!");

  return await navigator.serial.requestPort();
};
