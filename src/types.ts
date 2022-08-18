export interface InquirerAnswerTypes {
  files: string[];
  outputPath: string;
}

export type Flags = {
  dry?: boolean;
  output?: string;
};

export type ExportToFile = {
  stringifiedFile: string;
  testName: string;
  outputPath: string;
  outputFolder: string;
};

type UppercaseKeys =
  | 'NULL'
  | 'CANCEL'
  | 'HELP'
  | 'BACK_SPACE'
  | 'TAB'
  | 'CLEAR'
  | 'RETURN'
  | 'ENTER'
  | 'SHIFT'
  | 'CONTROL'
  | 'ALT'
  | 'PAUSE'
  | 'ESCAPE'
  | 'SPACE'
  | 'PAGE_UP'
  | 'PAGE_DOWN'
  | 'END'
  | 'HOME'
  | 'ARROW_LEFT'
  | 'LEFT'
  | 'ARROW_UP'
  | 'UP'
  | 'ARROW_RIGHT'
  | 'RIGHT'
  | 'ARROW_DOWN'
  | 'DOWN'
  | 'INSERT'
  | 'DELETE'
  | 'SEMICOLON'
  | 'EQUALS'
  | 'NUMPAD0'
  | 'NUMPAD1'
  | 'NUMPAD2'
  | 'NUMPAD3'
  | 'NUMPAD4'
  | 'NUMPAD5'
  | 'NUMPAD6'
  | 'NUMPAD7'
  | 'NUMPAD8'
  | 'NUMPAD9'
  | 'MULTIPLY'
  | 'ADD'
  | 'SEPARATOR'
  | 'SUBTRACT'
  | 'DECIMAL'
  | 'DIVIDE'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'COMMAND'
  | 'META';

export type DowncaseKeys =
  | 'null'
  | 'cancel'
  | 'help'
  | 'back_space'
  | 'tab'
  | 'clear'
  | 'return'
  | 'enter'
  | 'shift'
  | 'control'
  | 'alt'
  | 'pause'
  | 'escape'
  | 'space'
  | 'page_up'
  | 'page_down'
  | 'end'
  | 'home'
  | 'arrow_left'
  | 'left'
  | 'arrow_up'
  | 'up'
  | 'arrow_right'
  | 'right'
  | 'arrow_down'
  | 'down'
  | 'insert'
  | 'delete'
  | 'semicolon'
  | 'equals'
  | 'numpad0'
  | 'numpad1'
  | 'numpad2'
  | 'numpad3'
  | 'numpad4'
  | 'numpad5'
  | 'numpad6'
  | 'numpad7'
  | 'numpad8'
  | 'numpad9'
  | 'multiply'
  | 'add'
  | 'separator'
  | 'subtract'
  | 'decimal'
  | 'divide'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'command'
  | 'meta';

export const SupportedKeys: {
  [key in DowncaseKeys]: UppercaseKeys;
} = {
  null: 'NULL',
  cancel: 'CANCEL',
  help: 'HELP',
  back_space: 'BACK_SPACE',
  tab: 'TAB',
  clear: 'CLEAR',
  return: 'RETURN',
  enter: 'ENTER',
  shift: 'SHIFT',
  control: 'CONTROL',
  alt: 'ALT',
  pause: 'PAUSE',
  escape: 'ESCAPE',
  space: 'SPACE',
  page_up: 'PAGE_UP',
  page_down: 'PAGE_DOWN',
  end: 'END',
  home: 'HOME',
  arrow_left: 'ARROW_LEFT',
  left: 'LEFT',
  arrow_up: 'ARROW_UP',
  up: 'UP',
  arrow_right: 'ARROW_RIGHT',
  right: 'RIGHT',
  arrow_down: 'ARROW_DOWN',
  down: 'DOWN',
  insert: 'INSERT',
  delete: 'DELETE',
  semicolon: 'SEMICOLON',
  equals: 'EQUALS',

  numpad0: 'NUMPAD0',
  numpad1: 'NUMPAD1',
  numpad2: 'NUMPAD2',
  numpad3: 'NUMPAD3',
  numpad4: 'NUMPAD4',
  numpad5: 'NUMPAD5',
  numpad6: 'NUMPAD6',
  numpad7: 'NUMPAD7',
  numpad8: 'NUMPAD8',
  numpad9: 'NUMPAD9',
  multiply: 'MULTIPLY',
  add: 'ADD',
  separator: 'SEPARATOR',
  subtract: 'SUBTRACT',
  decimal: 'DECIMAL',
  divide: 'DIVIDE',

  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',

  command: 'COMMAND',
  meta: 'META',
};
