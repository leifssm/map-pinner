import { crayon } from 'crayon';
import { Computed, GridLayout, Signal, Tui, handleInput, handleKeyboardControls, handleMouseControls } from 'tui';
import { LogEntry, display } from '~/logger.ts';

const FPS = 10;
export const tui = new Tui({
  style: crayon.bgBlack,
  refreshRate: 1000 / FPS,
});
export const charMap = 'rounded';

handleInput(tui);
handleMouseControls(tui);
handleKeyboardControls(tui);
tui.dispatch();
tui.run();

export const layout = new GridLayout({
  pattern: [
    ['a', 'b', 'b', 'b', 'b', 'c'],
    ['a', 'b', 'b', 'b', 'b', 'd'],
    ['a', 'b', 'b', 'b', 'b', 'e'],
  ],
  gapX: 2,
  gapY: 2,
  rectangle: new Computed(() => {
    const { width, height, column, row } = tui.rectangle.value;
    return {
      width: width + 1,
      height: height + 2,
      column: column - 1,
      row: row - 1,
    };
  }),
});

type GetLayout<T> = T extends GridLayout<infer L> ? L : never;
export type LayoutElements = GetLayout<typeof layout>;

type CommandLog = {
  message: string;
};

export const logSignal = new Signal<LogEntry[]>([]);
export const adminLog = new Signal<CommandLog[]>([]);
export const showLogs = new Signal(true);
export const showInfo = new Signal(true);
export const showWarnings = new Signal(true);
export const showErrors = new Signal(true);
export const commandLineLookback = new Signal(0);
export const commandSuggestion = new Signal<string | null>(null);

const startEntry = {
  message: 'Start of log',
  type: '------' as 'LOG',
  timestamp: new Date(),
} satisfies LogEntry;

display.action.listen(e => {
  logSignal.value = [startEntry, ...e];
});
