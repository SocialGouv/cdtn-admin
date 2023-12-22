"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LOG_LEVEL = void 0;
const winston_1 = require("winston");
const consoleTransport = new winston_1.transports.Console({
    format: winston_1.format.combine(winston_1.format.colorize({ message: true }), winston_1.format.timestamp({
        format: "MM-DD HH:mm:ss.SSS",
    }), winston_1.format.printf((info) => `${info.timestamp} | ${info.level.padEnd(5)} | ${info.message}` +
        (info.splat !== undefined ? `${info.splat}` : " "))),
});
exports.LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
exports.logger = (0, winston_1.createLogger)({ level: exports.LOG_LEVEL, transports: [] });
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(consoleTransport);
}
else {
    exports.logger.add(new winston_1.transports.Console({
        format: winston_1.format.json(),
    }));
}
