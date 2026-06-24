# Logger (app/utils/logger)

Lightweight development logger with colored console output, instance and static APIs, and an attachable buffer.

## Overview

- Exports: `LOG_LEVELS`, `LogLevel`, `LoggerService`, `Logger`.
- Purpose: provide a consistent, pretty-printed console logger for development with optional override of the logging backend.

## Key Concepts

- `Logger`: class you can instantiate with an optional `context` string. Example: `new Logger('Auth')`.
- Static API: use `Logger.log(...)`, `Logger.error(...)`, etc. without creating an instance.
- `LoggerService`: an interface describing a pluggable logger backend (methods: `log`, `error`, `warn`, optional `debug`, `verbose`, `fatal`, `setLogLevels`).
- `LOG_LEVELS` / `LogLevel`: supported levels are `verbose`, `debug`, `log`, `warn`, `error`, `fatal`.

## Basic Usage

Instance:

```ts
import { Logger } from "../utils/logger";

const logger = new Logger("MyContext");
logger.log("Server started", { port: 3000 });
logger.debug("Debugging value", { foo: "bar" });
logger.error("Unhandled error", new Error("boom"));
```

Static:

```ts
import { Logger } from "../utils/logger";

Logger.log("Application booting");
Logger.warn("Configuration missing, using defaults");
```

Context override: most logging methods accept an extra trailing string argument which will be used as the context for that call (it overrides the instance context).

```ts
const logger = new Logger("DefaultContext");
logger.log("A message", "PerCallContext"); // uses 'PerCallContext' for this message
```

## Buffering

The logger supports an attachable buffer which queues log calls instead of printing immediately. Useful during early boot before a backend is available.

```ts
Logger.attachBuffer();
Logger.log("Queued message");
// later, when ready:
Logger.flush(); // will print queued messages and detach the buffer
```

## Overriding the logger backend

You can replace the built-in pretty printer with any object implementing `LoggerService`, or change enabled log levels:

```ts
import { Logger } from "../utils/logger";

// Replace backend
Logger.overrideLogger(myLoggerService);

// Set enabled levels (array of LogLevel)
Logger.overrideLogger(["log", "warn", "error"]);

// Disable logging completely
Logger.overrideLogger(false);

// Re-enable defaults
Logger.overrideLogger(true);
```

When a custom backend is set, the logger will call the corresponding level method on that backend, falling back to `log` if a level method is missing.

## Helpful Notes

- The default pretty printer uses colored console output and prints a timestamp by default.
- Passing `undefined` or `null` items will be ignored by the pretty printer.
- Arrays of objects will be shown with `console.table`; plain objects use `console.dir`.
- `Logger.getTimestamp()` returns an ISO timestamp string.

## File

See source: [app/utils/logger/index.ts](app/utils/logger/index.ts)
