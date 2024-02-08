import { crayon } from 'crayon';
import { formatDate } from '@/display/utils.ts';
import {
  tui,
  layout,
  charMap,
  logSignal,
  adminLog,
  showErrors,
  showInfo,
  showLogs,
  showWarnings,
  commandLineLookback,
  commandSuggestion,
} from '@/display/base.ts';
import { Button, Frame, Input, Table, Text } from 'tui-c';
import { Computed, Effect } from 'tui';
import { display } from '~/logger.ts';
import { CommandParser } from '~/command-parser.ts';
import * as create from '@/display/components/create.ts';

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
      row: row - 1,
      column: column - 1,
      height: height,
    };
  }),
  // @ts-ignore works
  headers: new Computed(() => {
    // const width = layout.rectangle.value.width - layout.element('a').value.width;
    const width = layout.element('b').value.width;
    return [{ title: '        Time       ' }, { title: ' Type ' }, { title: '  Message'.padEnd(width - 27, ' ') }];
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

table.on('mousePress', e => {
  if (e.release || e.button !== 0 || e.movementX !== 0 || e.movementY !== 0 || table.state.peek() !== 'focused') return;
  const selectedRow = table.selectedRow.peek();
  const { message, timestamp, type, extra } = logSignal.value[selectedRow];
  create.popup(`${type} logged at ${timestamp}:\n${message}\n${extra?.join(', ') ?? ''}`);
});

// Table Effect
new Effect(() => {
  const scrollOffset = logSignal.value.length - layout.element('b').value.height + 3;
  if (scrollOffset == table.offsetRow.peek()) table.offsetRow.value++;
  if (scrollOffset == table.selectedRow.peek()) table.selectedRow.value++;
});

export const commandline = new Input({
  parent: table,
  placeholder: 'Type here...',
  theme: {
    base: crayon.bgBlack.white,
    focused: crayon.bgLightBlack.black,
    cursor: {
      base: crayon.invert,
    },
  },
  rectangle: new Computed(() => {
    const { width, column, row, height } = layout.element('b').value;
    return {
      width: width - 10,
      column: column + 1,
      row: height + row - 1,
    };
  }),
  zIndex: 1,
});

const submitButton = new Button({
  parent: commandline,
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
      column: column + width - 9,
      row: height + row - 1,
      height: 1,
    };
  }),

  zIndex: 1,
});

const inputFrame = new Frame({
  parent: commandline,
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
  parent: commandline,
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

export const terminal = new CommandParser({
  toggle: {
    log: () => (showLogs.value = !showLogs.value),
    info: () => (showInfo.value = !showInfo.value),
    warn: () => (showWarnings.value = !showWarnings.value),
    error: () => (showErrors.value = !showErrors.value),
    allOn: () => {
      showLogs.value = showInfo.value = showWarnings.value = showErrors.value = true;
    },
    allOff: () => {
      showLogs.value = showInfo.value = showWarnings.value = showErrors.value = false;
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
  line: () => display.action.log('----------------------------------------'),
  note: note => display.action.log(note),
});

const handleSubmit = () => {
  const value = commandline.text.peek();
  const result = terminal.safeParse(value);
  if (result) {
    adminLog.value = [...adminLog.peek(), { message: value }];
    commandline.cursorPosition.value = 0;
    commandline.text.value = '';
    commandLineLookback.value = adminLog.peek().length;
  }
};

commandline.on('keyPress', e => {
  const unpure = e.ctrl || e.meta || e.shift;
  switch (e.key) {
    case 'return': {
      if (unpure) return;
      handleSubmit();
      return;
    }
    case 'up': {
      if (unpure) return;
      if (commandLineLookback.peek() <= 0 || adminLog.peek().length === 0) return;
      commandLineLookback.value--;
      const newMessage = adminLog.peek()[commandLineLookback.value].message;
      commandline.text.value = newMessage;
      commandline.cursorPosition.value = newMessage.length;
      return;
    }
    case 'down': {
      if (unpure) return;
      if (commandLineLookback.peek() >= adminLog.peek().length) return;
      commandLineLookback.value++;
      const newMessage = adminLog.peek()[commandLineLookback.value]?.message ?? '';
      commandline.text.value = newMessage;
      commandline.cursorPosition.value = newMessage.length;
      return;
    }
    case 'tab': {
      if (unpure) return;
      let newText = commandline.text.peek().replace(/\t/g, '');
      let newCursorPosition = Math.min(newText.length, newText.length);

      const suggestion = commandSuggestion.peek();
      if (suggestion != null) {
        newText = suggestion;
        newCursorPosition = suggestion.length;
      }
      commandline.text.value = newText;
      commandline.cursorPosition.value = newCursorPosition;
    }
  }
});

submitButton.on('mousePress', handleSubmit);
