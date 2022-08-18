import { globbySync } from 'globby';

export function expandedFiles(files: string[]): string[] {
  const containsGlob = files.some((file: string) => file.includes('*'));

  return containsGlob ? globbySync(files) : files;
}
