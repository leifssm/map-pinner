import '~/extended-promises.ts';
import { crayon } from 'crayon';
import {
  Computed,
  Effect,
  GridLayout,
  Rectangle,
  Signal,
  Tui,
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
} from 'tui';
import { Box, Button, CheckBox, Frame, Input, Label, Table, Text } from 'tui-c';
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

const padCenter = (value: unknown, length = 2) => {
  const s = value?.toString() ?? '';
  const diff = length - s.length;
  return s
    .padStart(Math.floor(diff / 2) + s.length, ' ')
    .padEnd(length, ' ');
}

const formatDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${pad(day)}/${pad(month)}/${pad(year)}`;
};

type CommandLog = {
  message: string;
};

// --- Signals ---
const logSignal = new Signal<LogEntry[]>([]);
const adminLog = new Signal<CommandLog[]>([]);
const showLogs = new Signal(true);
const showInfo = new Signal(true);
const showWarnings = new Signal(true);
const showErrors = new Signal(true);

const startEntry = {
  message: 'Start of log',
  type: '------' as 'LOG',
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

const commandline = new Input({
  parent: tui,
  placeholder: 'Type here...',
  theme: {
    base: crayon.bgBlack.white,
    focused: crayon.bgLightBlack.black,
    active: crayon.bgCyan.black,
    cursor: {
      base: crayon.invert,
    },
  },
  rectangle: new Computed(() => {
    const { width, column, row, height } = layout.element('b').value;
    return {
      width: width - 11,
      column: column + 1,
      row: height + row - 2,
    };
  }),
  zIndex: 1,
});

const submitButton = new Button({
  parent: tui,
  theme: {
    base: crayon.bgGreen.white,
    focused: crayon.bgRgb(26, 138, 89).black,
    active: crayon.bgRgb(22, 86, 56).white,
  },
  label: {
    text: 'Submit',
  },
  rectangle: new Computed(() => {
    const { width, column, row, height } = layout.element('b').value;
    return {
      width: 8,
      column: column + width - 10,
      row: height + row - 2,
      height: 2,
    };
  }),

  zIndex: 1,
});

const inputFrame = new Frame({
  parent: tui,
  theme: {
    base: tui.style,
  },
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
  theme: {
    base: tui.style,
  },
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
    theme: {
      base: tui.style,
    },
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
      base: crayon.bgCyan.bold,
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
    theme: {
      base: tui.style,
    },
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

const createPopup = () => {
  const width = 40;
  const height = 10;
  const tuiSize = tui.rectangle.peek();

  const rectangle = new Signal<Rectangle>({
    column: Math.floor(tuiSize.width / 2 - width / 2),
    row: Math.floor(tuiSize.height / 2 - height / 2),
    width: width,
    height: height,
  });

  const popup = new Box({
    parent: tui,
    theme: {
      base: crayon.bgLightBlack.white,
    },
    rectangle,
    zIndex: 100,
  });
  popup.interact = () => {
    popup.state.value = 'focused';
  };
  new Frame({
    parent: popup,
    charMap: 'sharp',
    theme: {
      base: popup.style.peek(),
    },
    rectangle,
    zIndex: popup.zIndex.peek(),
  });

  const closeButton = new Button({
    parent: popup,
    theme: {
      base: crayon.bgRed.white,
      focused: crayon.bgLightBlack.white,
      active: crayon.bgRed.black,
    },
    label: {
      text: 'X',
    },
    rectangle: new Computed(() => {
      const { width, column, row } = rectangle.value;
      return {
        column: column + width - 4,
        row: row,
        width: 3,
        height: 1,
      };
    }),
    zIndex: popup.zIndex.peek(),
  });

  closeButton.on('mousePress', () => popup.destroy());

  let destroyed = false;
  const onDestroy: VoidFunction[] = [];

  popup.on('destroy', () => {
    destroyed = true;
    for (const f of onDestroy) f();
    onDestroy.length = 0;
  });

  return {
    rectangle,
    onClose: (f: VoidFunction) => {
      if (destroyed) return void f();
      onDestroy.push(f);
    },
  };
};

createTextForLayout('c', { x: 7, y: 0 }, 'Log Viewer');
createTextForLayout('c', { x: 1, y: 1 }, 'Show Logs');
createCheckBoxForLayout('c', { x: -2, y: 1 }, showLogs);

createTextForLayout('c', { x: 1, y: 2 }, 'Show Info');
createCheckBoxForLayout('c', { x: -2, y: 2 }, showInfo);

createTextForLayout('c', { x: 1, y: 3 }, 'Show Warnings');
createCheckBoxForLayout('c', { x: -2, y: 3 }, showWarnings);

createTextForLayout('c', { x: 1, y: 4 }, 'Show Errors');
createCheckBoxForLayout('c', { x: -2, y: 4 }, showErrors);

type CommandTree = {
  [key: string]: CommandTree | VoidFunction;
} & {
  index?: VoidFunction;
};

const commandTree: CommandTree = {
  toggle: {
    log: () => (showLogs.value = !showLogs.value),
    info: () => (showInfo.value = !showInfo.value),
    warn: () => (showWarnings.value = !showWarnings.value),
    error: () => (showErrors.value = !showErrors.value),
    allOn: () => {
      showLogs.value = true;
      showInfo.value = true;
      showWarnings.value = true;
      showErrors.value = true;
    },
    allOff: () => {
      showLogs.value = false;
      showInfo.value = false;
      showWarnings.value = false;
      showErrors.value = false;
    },
    index: () => {
      const newState = !(showLogs.peek() && showInfo.peek() && showWarnings.peek() && showErrors.peek());
      showLogs.value = newState;
      showInfo.value = newState;
      showWarnings.value = newState;
      showErrors.value = newState;
    },
  },
  stop: () => Deno.exit(),
  alert: () => void createPopup(),
  line: () => display.action.log('----------------------------------------'),
};

const runCommand = (command: string) => {
  if (!command.startsWith('/')) return false;
  const args = command.slice(1).split(' ');
  if (args.length === 1 && args[0] === '') return false;

  let current = commandTree;
  for (let i = 0; i < args.length; i++) {
    const argument = args[i];
    const value = current[argument];

    if (!value) return false;
    if (typeof value === 'function') {
      if (i !== args.length - 1) return false;
      value();
      return true;
    }
    current = value;
  }
  if (current.index) {
    current.index();
    return true;
  }
  return false;
};

let commandLineLookback = 0;
const handleSubmit = () => {
  const value = commandline.text.peek();
  const result = runCommand(value);
  if (result) {
    adminLog.value = [...adminLog.peek(), { message: value }];
    commandline.cursorPosition.value = 0;
    commandline.text.value = '';
    commandLineLookback = adminLog.peek().length;
  }
};

commandline.on('keyPress', e => {
  const unpure = e.ctrl || e.meta || e.shift;
  switch (e.key) {
    case 'return':
      if (unpure) return;
      handleSubmit();
      return;
    case 'up': {
      if (unpure) return;
      if (commandLineLookback <= 0 || adminLog.peek().length === 0) return;
      commandLineLookback--;
      const newMessage = adminLog.peek()[commandLineLookback].message;
      commandline.text.value = newMessage;
      commandline.cursorPosition.value = newMessage.length;
      return;
    }
    case 'down': {
      if (unpure) return;
      if (commandLineLookback >= adminLog.peek().length) return;
      commandLineLookback++;
      const newMessage = adminLog.peek()[commandLineLookback]?.message ?? '';
      commandline.text.value = newMessage;
      commandline.cursorPosition.value = newMessage.length;
      return;
    }
  }
});

submitButton.on('mousePress', handleSubmit);
adminLog.value = [];

new Label({
  parent: tui,
  theme: {
    base: crayon.bgBlack.white,
  },
  text: new Computed(() => {
    const rect = layout.element('d').value;
    const latestCommands = adminLog.value.slice(-(rect.height - 3));
    return (
      padCenter("Recent Commands", rect.width - 2) + 
      '\n' +
      latestCommands.map(v => v.message).join('\n')
    );
  }),
  rectangle: new Computed(() => {
    const { column, row } = layout.element('d').value;
    return {
      column: column + 1,
      row: row + 1,
    };
  }),
  zIndex: 1,
});