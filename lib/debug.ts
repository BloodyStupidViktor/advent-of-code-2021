const originalConsoleLog = console.log;
const noop = () => {};

export const enableConsoleLog = () => {
  console.log = originalConsoleLog;
};

export const disableConsoleLog = () => {
  console.log = noop;
};
