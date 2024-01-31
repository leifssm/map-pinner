// deno-lint-ignore-file ban-types
const logToFile = false;

const logTypes = ['log', 'info', 'warn', 'error'] as const;
const categories = ['action'] as const;

type LogTypes = (typeof logTypes)[number];
type Categories = (typeof categories)[number];

export interface LogEntry {
  message: string;
  type: Uppercase<LogTypes>;
  timestamp: Date;
  extra?: unknown[];
}

type DisplayEntry = {
  [type in LogTypes]: (...args: any[]) => void;
} & {
  listen: (listener: LogListener) => void;
} & {};

type Display<Categories extends string> = {
  [category in Categories]: DisplayEntry;
} & {};

type LogListener = (logEntries: LogEntry[]) => void;

type LogCatalog = {
  [category in Categories]: {
    entries: LogEntry[];
    listeners: LogListener[];
  };
} & {};

const log = {} as LogCatalog;
export const display = {} as Display<Categories>;

for (const category of categories) {
  const logList = [] as LogEntry[];
  const entry = {} as DisplayEntry;
  const logEntry = {
    entries: logList,
    listeners: [] as LogListener[],
  };
  log[category] = logEntry;

  for (const type of logTypes) {
    entry[type] = (...args: unknown[]) => {
      logList.push({
        timestamp: new Date(),
        type: type.toUpperCase() as Uppercase<LogTypes>,
        message: args.join(' '),
      });
      for (const listener of logEntry.listeners) {
        listener(logList);
      }
    };
  }
  entry.listen = (listener: LogListener) => {
    logEntry.listeners.push(listener);
    listener(logList);
  };
  display[category] = entry;

  if (logToFile) {
    throw new Error('Not implemented');
  }
}

// display.action.listen(e => {
//   const last = e.at(-1);
//   if (!last) return;
//   console.log(last.type, last.message)
// })
