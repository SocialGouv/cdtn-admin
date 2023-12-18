import { createLogger, format, transports } from "winston";

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize({ message: true }),
    format.timestamp({
      format: "MM-DD HH:mm:ss.SSS",
    }),
    format.printf(
      (info) =>
        `${info.timestamp} | ${info.level.padEnd(5)} | ${info.message}` +
        (info.splat !== undefined ? `${info.splat}` : " ")
    )
  ),
});

export const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
export const logger = createLogger({ level: LOG_LEVEL, transports: [] });

if (process.env.NODE_ENV !== "production") {
  logger.add(consoleTransport);
} else {
  logger.add(
    new transports.Console({
      format: format.json(),
    })
  );
}
