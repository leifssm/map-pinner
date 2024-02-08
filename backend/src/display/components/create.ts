import { crayon } from 'crayon';
import { Computed, Rectangle, Signal } from 'tui';
import { Box, Button, CheckBox, Frame, Label, Text } from 'tui-c';
import { tui, charMap, LayoutElements, layout } from '@/display/base.ts';
import { fitTextToBox } from '@/display/utils.ts';

export type CharMap = 'rounded' | 'sharp';

export const frameForLayout = (element: LayoutElements) => {
  new Frame({
    parent: tui,
    theme: {
      base: tui.style,
    },
    charMap: charMap,
    rectangle: layout.element(element),
    zIndex: 1,
  });
};

export const checkBoxForLayout = (
  element: LayoutElements,
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
      const y = offset.y < 0 ? height + offset.y : offset.y;

      return {
        column: column + x,
        row: row + y,
        width: 3,
        height: 1,
      };
    }),
    checked,
    zIndex: 0,
  });
};

export const textForLayout = (
  element: LayoutElements,
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
      const length = typeof text === 'string' ? text.length : text.value.length;

      const x = offset.x < 0 ? width + offset.x - length + 1 : offset.x;
      const y = offset.y < 0 ? height + offset.y : offset.y;

      return {
        column: column + x,
        row: row + y,
      };
    }),
    zIndex: 3,
  });
};

const popupIndexes: number[] = [];
export const popup = (text: string) => {
  const index = popupIndexes.length ? popupIndexes.at(-1)! + 1 : 0;
  popupIndexes.push(index);

  const width = 40;
  const height = 15;
  const tuiSize = tui.rectangle.peek();

  const rectangle = new Signal<Rectangle>({
    column: Math.floor(tuiSize.width / 3 - width / 2) + index,
    row: Math.floor(tuiSize.height / 2 - height / 2) + index,
    width: width,
    height: height,
  });

  const popup = new Box({
    parent: tui,

    theme: {
      base: crayon.bgLightBlack.white,
    },
    rectangle,
    zIndex: 100 + index * 3,
  });

  new Label({
    parent: popup,
    theme: {
      base: popup.style.peek(),
    },
    zIndex: popup.zIndex.peek() + 1,
    text: fitTextToBox(text, width - 2, height - 2),
    // @ts-ignore it works
    rectangle: new Computed(() => {
      const { width, column, row } = rectangle.value;
      return {
        column: column + 1,
        row: row + 1,
        width: width - 2,
        height: height - 2,
      };
    }),
  });

  const frame = new Frame({
    parent: popup,
    charMap: 'sharp',
    theme: {
      base: popup.style.peek(),
    },
    rectangle,
    zIndex: popup.zIndex.peek() + 1,
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
    zIndex: popup.zIndex.peek() + 2,
  });

  let destroyed = false;
  const onDestroy: VoidFunction[] = [
    () => popupIndexes.splice(popupIndexes.lastIndexOf(index), 1),
    () => frame.destroy()
  ];

  popup.on('destroy', () => {
    destroyed = true;
    for (const f of onDestroy) f();
    onDestroy.length = 0;
  });

  closeButton.on('mousePress', () => popup.destroy());

  return {
    rectangle,
    onClose: (f: VoidFunction) => {
      if (destroyed) return void f();
      onDestroy.push(f);
    },
  };
};

let colorIndex = 0;
const colors = [crayon.bgRed, crayon.bgGreen, crayon.bgYellow, crayon.bgBlue, crayon.bgMagenta, crayon.bgCyan];
export const uiBox = (element: LayoutElements) => {
  new Box({
    parent: tui,
    theme: {
      base: colors[colorIndex++ % colors.length],
    },
    rectangle: layout.element(element),
    zIndex: 10,
  });
};
