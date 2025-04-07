"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const isDevelopment = process.env.NODE_ENV !== "production";
exports.logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    error: (...args) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};
