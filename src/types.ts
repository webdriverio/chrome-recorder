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

export interface TransformOpts {
  files: string[];
  outputPath: string;
  flags: Flags;
}
