export type CommandTree = {
  [key: string]: CommandTree | ((...args: string[]) => void);
} & {
  index?: VoidFunction;
};

export interface ToolTip {
  tooltip: string;
  action: string | null;
}

// Not my proudest work, but it works
export class CommandParser {
  tree: CommandTree;
  #commandRegex = /^\/(?:[\w\d]+(?: [\w\d]+)* ?)?\t?$/;

  constructor(tree: CommandTree) {
    this.tree = tree;
  }

  #getCommandArray(command: string) {
    if (!this.#commandRegex.test(command)) return null;
    return command.slice(1).replace(/\t$/, '').split(' ');
  }

  parse(command: string) {
    const commands = this.#getCommandArray(command);
    if (!commands) throw new Error('Invalid command');

    let current: CommandTree = this.tree;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const value = current[command];
      if (!value) throw new Error('Command not found');

      if (typeof value === 'function') {
        const expectedArgs = value.length;
        const providedArgs = commands.slice(i + 1);
        const providedArgsLength = providedArgs.length;
        if (expectedArgs !== providedArgsLength)
          throw new Error(
            `Found command ${command}, but expected ${expectedArgs} arguments, and got ${providedArgsLength}`
          );

        value(...providedArgs);
        return;
      }

      current = value;
    }
    if (!current.index) throw new Error('Command not found');
    current.index();
  }

  safeParse(command: string) {
    try {
      this.parse(command);
      return true;
    } catch (_) {
      return false;
    }
  }

  getToolTip(command: string): ToolTip {
    if (!command || command === '')
      return {
        tooltip: '\n      Start typing\n        to see\n      suggestions.',
        action: null,
      };
    if (command[0] !== '/')
      return {
        tooltip: '',
        action: null,
      };
    const commands = this.#getCommandArray(command);
    if (!commands)
      return {
        tooltip: 'Invalid command',
        action: null,
      };

    let current: CommandTree = this.tree;

    for (let i = 0; i < commands.length - 1; i++) {
      const command = commands[i];
      const value = current[command];
      if (!value)
        return {
          tooltip: 'Command not found',
          action: null,
        };

      if (typeof value === 'function') {
        const validCommands = commands.filter(Boolean);
        const commandBranch = validCommands.join(' ');
        const numberOfSpaces = value.length - validCommands.length + 1;
        if (numberOfSpaces < 0) {
          const validArgs = commands.slice(0, i + 1).join(' ');
          return {
            tooltip: `/${validArgs} <Too many arguments>`,
            action: `/${validArgs}`,
          };
        }
        return {
          tooltip: `/${commandBranch}` + ' ___'.repeat(numberOfSpaces),
          action: `/${commandBranch}` + (numberOfSpaces ? ' ' : ''),
        };
      }

      current = value;
    }
    const branch = commands.slice(0, -1).join(' ');
    const searchWord = new RegExp('^' + commands[commands.length - 1]);
    const actions = Object.keys(current)
      .filter(e => searchWord.test(e) && e !== 'index')
      .sort()
      .map(k => '/' + (branch ? branch + ' ' + k : k) + (typeof current[k] === 'object' ? ' >' : ' '));

    // if (actions.length === 1) {
    //   const suggestedBranch = current[actions[0].slice(1)];
    //   const hasIndex = typeof suggestedBranch === 'object' && suggestedBranch?.index;
    //   if (!hasIndex) actions[0] += ' ';
    // }
    return {
      tooltip: actions.join('\n'),
      action: actions[0].replace(/ >$/, '')
    };
  }
}
