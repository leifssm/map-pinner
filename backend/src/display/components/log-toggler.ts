import { showLogs, showInfo, showWarnings, showErrors } from '@/display/base.ts';
import * as create from '@/display/components/create.ts';

const layout = 'c';
create.textForLayout(layout, { x: 8, y: 0 }, 'Log Viewer');
create.textForLayout(layout, { x: 1, y: 1 }, 'Show Logs');
create.checkBoxForLayout(layout, { x: -2, y: 1 }, showLogs);

create.textForLayout(layout, { x: 1, y: 2 }, 'Show Info');
create.checkBoxForLayout(layout, { x: -2, y: 2 }, showInfo);

create.textForLayout(layout, { x: 1, y: 3 }, 'Show Warnings');
create.checkBoxForLayout(layout, { x: -2, y: 3 }, showWarnings);

create.textForLayout(layout, { x: 1, y: 4 }, 'Show Errors');
create.checkBoxForLayout(layout, { x: -2, y: 4 }, showErrors);

create.frameForLayout(layout);
