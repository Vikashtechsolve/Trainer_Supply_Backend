export const logger = {
  log: (...args: unknown[]) => {
    console.log(new Date().toISOString(), ...args);
  },
  error: (...args: unknown[]) => {
    console.error(new Date().toISOString(), ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(new Date().toISOString(), ...args);
  },
  info: (...args: unknown[]) => {
    console.info(new Date().toISOString(), ...args);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(new Date().toISOString(), ...args);
    }
  },
};
