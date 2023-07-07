import { readFile } from 'node:fs';
import { join, dirname } from 'node:path';

export const readFileAsync = (relativePath: string) => {
  const rootDirPath = dirname(require.main.filename);
  const filePath = join(rootDirPath, relativePath);
  return new Promise((resolve, reject) => {
    readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
