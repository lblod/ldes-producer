import namespace, { NamespaceBuilder } from '@rdfjs/namespace';

import { Cache } from '../storage/caching/cache';
import { PromiseQueue, Queue } from '../utils/queue';
import { Node } from '../models/node';

export interface Config {
  folderDepth: number;
  subFolderNodeCount: number;
  pageResourcesCount: number;
  streamPrefix: NamespaceBuilder<string>;
  timeTreeRelationPath: string;
  prefixTreeRelationPath: string;
  cacheSize: number;
  baseFolder: string;
  baseUrl: string;
  cache: Cache;
  updateQueue: Queue<Node | null | void>;
}

export function getConfigFromEnv(): Config {
  const cacheSize = parseInt(process.env.CACHE_SIZE || '10');
  return {
    folderDepth: parseInt(process.env.FOLDER_DEPTH || '1'),
    subFolderNodeCount: parseInt(process.env.SUBFOLDER_NODE_COUNT || '10'),
    pageResourcesCount: parseInt(process.env.PAGE_RESOURCES_COUNT || '10'),
    streamPrefix: namespace(
      process.env.LDES_STREAM_PREFIX || 'http://mu.semte.ch/streams/'
    ),
    timeTreeRelationPath:
      process.env.TIME_TREE_RELATION_PATH ||
      'http://www.w3.org/ns/prov#generatedAtTime',
    prefixTreeRelationPath:
      process.env.PREFIX_TREE_RELATION_PATH || 'https://example.org/name',
    cacheSize,
    baseFolder: process.env.DATA_FOLDER || '/data',
    baseUrl: process.env.BASE_URL ?? '',
    cache: new Cache(cacheSize),
    updateQueue: new PromiseQueue<Node | null | void>(),
  };
}
