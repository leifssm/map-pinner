import { Computed } from 'tui';
import { Label } from 'tui-c';
import { tui, layout, adminLog } from '@/display/base.ts';
import { padCenter } from '@/display/utils.ts';
import { frameForLayout } from '@/display/components/create.ts';

new Label({
  parent: tui,
  theme: {
    base: tui.style,
  },
  text: new Computed(() => {
    const rect = layout.element('d').value;
    const latestCommands = adminLog.value.slice(-(rect.height - 3));
    return padCenter('Recent Commands', rect.width) + '\n' + latestCommands.map(v => v.message).join('\n');
  }),
  // @ts-ignore it works
  rectangle: new Computed(() => ({ ...layout.element('d').value })),
  zIndex: 1,
});

frameForLayout('d');
