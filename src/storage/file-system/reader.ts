import jsstream from 'stream';
import { Node } from '../../models/node';
import path from 'path';
import fs from 'fs';
const ttl_read = require('@graphy/content.ttl.read');

import rdfParser from 'rdf-parse';

import rdfSerializer from 'rdf-serialize';
import { convertToNode } from '../../converters/node-converters';
import { createStore } from '../../utils/utils';

/**
 * Reads the triples in a file, assuming text/turtle.
 *
 * @param {string} file File path where the turtle file is stored.
 * @return {Stream} Stream containing all triples which were downloaded.
 */

export function convert(
  file: string,
  contentType: string,
  domainName: string,
  baseFolder: string
): NodeJS.ReadableStream {
  const triplesStream = readTriplesStream(
    file,
    domainName + path.relative(baseFolder, file)
  );
  return rdfSerializer.serialize(triplesStream, {
    contentType: contentType,
  });
}

function readTriplesStream(file: string, baseIRI?: string): jsstream.Readable {
  if (!fs.existsSync(file)) {
    throw Error(`File does not exist: ${file}`);
  }
  const fileStream = fs.createReadStream(file);
  console.log('filestream created');
  if (baseIRI) {
    console.log('baseIRI', baseIRI);
    return rdfParser.parse(fileStream, {
      contentType: 'text/turtle',
      baseIRI,
    });
  } else {
    console.log('no baseIRI, pipe ttl_read');
    return fileStream.pipe(ttl_read());
  }
}

export async function readNode(filePath: string): Promise<Node> {
  try {
    console.log('reading node at', filePath);
    const store = await createStore(readTriplesStream(filePath));
    console.log('store', store);
    return convertToNode(store);
  } catch (e) {
    throw new Error(`Something went wrong while converting file to node: ${e}`);
  }
}
