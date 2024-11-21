import { Store, DataFactory, Quad, OTerm } from 'n3';
import { v4 as uuid } from 'uuid';
import { LDES_TIME, XML } from './namespaces';
import * as RDF from 'rdf-js';
const { literal } = DataFactory;
import { Readable } from 'stream';

interface Error {
  name: string;
  message: string;
  status?: number;
}

export type QuadElement =
  | RDF.Quad_Subject
  | RDF.Quad_Predicate
  | RDF.Quad_Object;

export function generateTreeRelation() {
  return LDES_TIME(`relations/${uuid()}`);
}

export function nowLiteral() {
  const xsdDateTime = XML('dateTime');
  const now = new Date().toISOString();
  return literal(now, xsdDateTime);
}

export function generateVersion(_namedNode: any) {
  return LDES_TIME(`versioned/${uuid()}`);
}

export function error(status: number, msg?: string) {
  const err: Error = new Error(msg || 'An error occurred');
  err.status = status;
  return err;
}

export function getFirstMatch(
  store: Store,
  subject?: OTerm,
  predicate?: OTerm,
  object?: OTerm,
  graph?: OTerm
): Quad | null {
  const matches = store.getQuads(
    subject || null,
    predicate || null,
    object || null,
    graph || null
  );
  if (matches.length > 0) {
    return matches[0];
  }
  return null;
}

/**
 * Yields the file path on which the specified page number is described.
 *
 * @param {number} page Page index for which we want te get the file path.
 * @return {string} Path to the page.
 */
export function fileForPage(folder: string, page: number): string {
  return `${folder}/${page}.ttl`;
}

export function pushToReadable<T>(readable: Readable, ...chunks: T[]) {
  chunks.forEach((chunk) => {
    readable.push(chunk);
  });
}

export async function createStore(
  quadStream: RDF.Stream<RDF.Quad>
): Promise<Store> {
  try {
    const store = new Store();
    await importToStore(store, quadStream);
    return store;
  } catch (e) {
    throw new Error(
      `Something went wrong while creating store from stream: ${e}`
    );
  }
}

export function importToStore(
  store: Store,
  quadStream: RDF.Stream<RDF.Quad>
): Promise<void> {
  return new Promise((resolve, reject) =>
    store
      .import(quadStream)
      .on('error', reject)
      .once('end', () => resolve())
  );
}

export function debugLog(...args: unknown[]): void {
  if (process?.env?.LDES_PRODUCER_LOG_LEVEL === 'debug') {
    console.log(...args);
  }
}
