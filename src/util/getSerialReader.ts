export const getSerialReader = async (
  port: SerialPort,
  options: SerialOptions
) => {
  await port.open(options);

  const reader = port.readable?.getReader();

  if (!reader) throw new Error("Device can' be read");

  return reader;
};
