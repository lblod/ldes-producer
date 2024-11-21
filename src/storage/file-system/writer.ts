import fs from 'fs';
import { Node } from '../../models/node';
import path from 'path';
import { pipeline } from 'stream/promises';
import { convertToStream } from '../../converters/node-converters';
import { StreamWriter } from 'n3';

async function createParentFolderIfNecessary(file: string) {
  if (!fs.existsSync(path.dirname(file))) {
    await new Promise<void>((resolve, reject) => {
      fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

export async function writeNode(node: Node, path: string) {
  const quadStream = convertToStream(node);

  await createParentFolderIfNecessary(path);
  const writeStream = fs.createWriteStream(path);

  await pipeline(quadStream, new StreamWriter(), writeStream);
}
