import '~/extended-promises.ts';
import { crayon } from 'crayon';
import {
  Computed,
  Effect,
  GridLayout,
  Signal,
  Tui,
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
} from 'tui';
import { Box, Button, CheckBox, Frame, Input, Label, Mark, Table, Text } from 'tui-c';
import { LogEntry, display } from '@/logger.ts';

const charMap = 'rounded';

const FPS = 20;
const tui = new Tui({
  style: crayon.bgBlack,
  refreshRate: 1000 / FPS,
});

handleInput(tui);
handleMouseControls(tui);
handleKeyboardControls(tui);
tui.dispatch();
tui.run();

const layout = new GridLayout({
  pattern: [
    ['a', 'a', 'b', 'b', 'b', 'c'],
    ['a', 'a', 'b', 'b', 'b', 'd'],
    ['a', 'a', 'b', 'b', 'b', 'e'],
  ],
  gapX: 1,
  gapY: 0,
  rectangle: tui.rectangle,
});

const pad = (value: unknown, length = 2) => {
  const s = value?.toString() ?? '';
  return s.padStart(length, '0');
};

const formatDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${pad(day)}/${pad(month)}/${pad(year)}`;
};

// --- Signals ---
const logSignal = new Signal<LogEntry[]>([]);
const showLogs = new Signal(true);
const showInfo = new Signal(true);
const showWarnings = new Signal(true);
const showErrors = new Signal(true);

const startEntry = {
  message: 'Start of log',
  type: '------' as "LOG",
  timestamp: new Date(),
} satisfies LogEntry;

display.action.listen(e => {
  logSignal.value = [startEntry, ...e];
});

const table = new Table({
  parent: tui,
  theme: {
    base: crayon.bgBlack.white,
    frame: {
      base: crayon.bgBlack,
    },
    header: {
      base: crayon.bgBlack.bold.lightBlue,
    },
    selectedRow: {
      base: crayon.bold.bgBlue.white,
      focused: crayon.bold.bgLightBlue.white,
      active: crayon.bold.bgMagenta.black,
    },
  },
  // @ts-ignore works
  rectangle: new Computed(() => {
    const { height, row, column } = layout.element('b').value;
    return {
      row,
      column,
      height: height - 2,
    };
  }),
  // @ts-ignore works
  headers: new Computed(() => {
    // const width = layout.rectangle.value.width - layout.element('a').value.width;
    const width = layout.element('b').value.width;
    return [{ title: '        Time       ' }, { title: ' Type ' }, { title: '  Message'.padEnd(width - 29, ' ') }];
  }),
  // @ts-ignore works
  data: new Computed(() => {
    const entries = logSignal.value;
    const logs = showLogs.value;
    const info = showInfo.value;
    const warnings = showWarnings.value;
    const errors = showErrors.value;

    return entries
      .filter(entry => {
        if (entry.type === 'LOG' && !logs) return false;
        if (entry.type === 'INFO' && !info) return false;
        if (entry.type === 'WARN' && !warnings) return false;
        if (entry.type === 'ERROR' && !errors) return false;
        return true;
      })
      .map(entry => [formatDate(entry.timestamp), entry.type, entry.message]);
  }),

  charMap,
  zIndex: 0,
});

// Table Effect
new Effect(() => {
  const scrollOffset = logSignal.value.length - layout.element('b').value.height + 5;
  if (scrollOffset == table.offsetRow.peek()) table.offsetRow.value++;
  if (scrollOffset == table.selectedRow.peek()) table.selectedRow.value++;
});

new Input({
  parent: tui,
  placeholder: 'Type here...',
  theme: {
    base: crayon.bgGreen,
    focused: crayon.bgLightGreen,
    active: crayon.bgYellow,
    cursor: {},
  },
  rectangle: new Computed(() => {
    const { width, column, row, height } = layout.element('b').value;
    return {
      width: width - 5,
      column: column + 1,
      row: height + row - 2,
    };
  }),
  zIndex: 1,
});

const inputFrame = new Frame({
  parent: tui,
  theme: {},
  charMap: charMap,
  rectangle: new Computed(() => {
    const { width, column, row, height } = table.rectangle.value;
    return {
      width: width - 2,
      height: 1,
      column: column + 1,
      row: height + row,
    };
  }),
  zIndex: 1,
});

new Text({
  parent: tui,
  theme: {},
  text: new Computed(() => {
    const { leftHorizontal, rightHorizontal, horizontal } = table.charMap.peek();
    return leftHorizontal + horizontal.repeat(Math.max(0, table.rectangle.value.width - 2)) + rightHorizontal;
  }),
  rectangle: new Computed(() => {
    const { column, row } = inputFrame.rectangle.value;
    return {
      column: column - 1,
      row: row - 1,
    };
  }),
  zIndex: 2,
});

type GetElements<T> = T extends GridLayout<infer E> ? E : never;
type LayoutElement = GetElements<typeof layout>;

const createFrameForLayout = (element: LayoutElement) => {
  new Frame({
    parent: tui,
    theme: {},
    charMap: charMap,
    rectangle: new Computed(() => {
      const { width, column, row, height } = layout.element(element).value;
      return {
        width: width,
        height: height - 2,
        column: column,
        row: row + 1,
      };
    }),
    zIndex: 1,
  });
};

createFrameForLayout('c');
createFrameForLayout('d');
createFrameForLayout('e');

const createCheckBoxForLayout = (
  element: LayoutElement,
  offset: { x: number; y: number },
  checked: boolean | Signal<boolean> = false
) => {
  new CheckBox({
    parent: tui,
    theme: {
      base: crayon.bgCyan.white,
      focused: crayon.bgLightBlack.white,
      active: crayon.bgYellow,
    },
    rectangle: new Computed(() => {
      const { column, row, width, height } = layout.element(element).value;

      const x = offset.x < 0 ? width + offset.x - 2 : offset.x;
      const y = offset.y < 0 ? height + offset.y - 2 : offset.y;

      return {
        column: column + x,
        row: row + y + 1,
        width: 3,
        height: 1,
      };
    }),
    checked,
    zIndex: 0,
  });
};

const createTextForLayout = (
  element: LayoutElement,
  offset: { x: number; y: number },
  text: string | Signal<string>
) => {
  new Text({
    parent: tui,
    theme: {},
    text,
    rectangle: new Computed(() => {
      const { column, row, width, height } = layout.element(element).value;
      const l = typeof text === 'string' ? text.length : text.value.length;

      const x = offset.x < 0 ? width + offset.x - l + 1 : offset.x;
      const y = offset.y < 0 ? height + offset.y - 2 : offset.y;

      return {
        column: column + x,
        row: row + y + 1,
      };
    }),
    zIndex: 3,
  });
};

createTextForLayout('c', { x: 0, y: 0 }, 'Log Viewer');
createTextForLayout('c', { x: 0, y: 1 }, 'Show Logs');
createCheckBoxForLayout('c', { x: -1, y: 1 }, showLogs);

createTextForLayout('c', { x: 0, y: 2 }, 'Show Info');
createCheckBoxForLayout('c', { x: -1, y: 2 }, showInfo);

createTextForLayout('c', { x: 0, y: 3 }, 'Show Warnings');
createCheckBoxForLayout('c', { x: -1, y: 3 }, showWarnings);

createTextForLayout('c', { x: 0, y: 4 }, 'Show Errors');
createCheckBoxForLayout('c', { x: -1, y: 4 }, showErrors);

// setInterval(() => {
//   display.action.error('This is an error message');
// }, 1000);
