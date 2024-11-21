import jsstream from 'stream';
import { Node } from '../../models/node';
import path from 'path';
import fs from 'fs';

import rdfParser from 'rdf-parse';

import rdfSerializer from 'rdf-serialize';
import { convertToNode } from '../../converters/node-converters';
import { createStore, debugLog } from '../../utils/utils';

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

function readTriplesStream(file: string, baseIRI = '.'): jsstream.Readable {
  if (!fs.existsSync(file)) {
    throw Error(`File does not exist: ${file}`);
  }
  const fileStream = fs.createReadStream(file);
  debugLog('filestream created');
  return rdfParser.parse(fileStream, {
    contentType: 'text/turtle',
    baseIRI,
  });
}

export async function readNode(filePath: string): Promise<Node> {
  try {
    debugLog('reading node at', filePath);
    const store = await createStore(readTriplesStream(filePath));
    debugLog('store', store);
    return convertToNode(store);
  } catch (e) {
    throw new Error(`Something went wrong while converting file to node: ${e}`);
  }
}
