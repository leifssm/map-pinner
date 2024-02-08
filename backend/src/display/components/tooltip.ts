import { Computed } from 'tui';
import { Label } from 'tui-c';
import { tui, layout, commandSuggestion } from '@/display/base.ts';
import { padCenter, cropTextToBox } from '@/display/utils.ts';
import { commandline, terminal } from '@/display/components/table.ts';
import { frameForLayout } from '@/display/components/create.ts';

new Label({
  parent: tui,
  theme: {
    base: tui.style,
  },
  text: new Computed(() => {
    const currentCommand = commandline.text.value;
    const rect = layout.element('e').value;
    const tip = terminal.getToolTip(currentCommand);
    const text = padCenter('Tooltip', rect.width - 2) + '\n' + tip.tooltip;
    commandSuggestion.value = tip.action;
    return cropTextToBox(text, rect.width, rect.height);
  }),
  rectangle: new Computed(() => {
    const { column, row } = layout.element('e').value;
    return {
      column: column + 1,
      row: row,
    };
  }),
  zIndex: 1,
});

frameForLayout('e');
