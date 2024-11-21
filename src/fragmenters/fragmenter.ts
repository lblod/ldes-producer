import { DataFactory, NamedNode } from 'n3';
import { Node } from '../models/node';
import * as RDF from 'rdf-js';
import path from 'path';
import { Member } from '../models/member';
import { Config } from '../models/config';
import { debugLog } from '../utils';
const { namedNode } = DataFactory;

export interface FragmenterArgs {
  folder: string;
  maxResourcesPerPage: number;
  maxNodeCountPerSubFolder: number;
  folderDepth: number;
}
export abstract class Fragmenter {
  folder: string;
  maxResourcesPerPage: number;
  abstract relationPath: RDF.NamedNode;
  maxNodeCountPerSubFolder: number;
  folderDepth: number;
  config: Config;
  constructor(
    config: Config,
    {
      folder,
      maxResourcesPerPage,
      maxNodeCountPerSubFolder,
      folderDepth,
    }: FragmenterArgs
  ) {
    this.folder = folder;
    this.maxResourcesPerPage = maxResourcesPerPage;
    this.maxNodeCountPerSubFolder = maxNodeCountPerSubFolder;
    this.folderDepth = folderDepth;
    this.config = config;
  }
  constructNewNode(): Node {
    const nodeId = (this.config.cache.getLastPage(this.folder) || 0) + 1;
    this.config.cache.updateLastPage(this.folder, nodeId);

    const node = new Node({
      id: nodeId,
      stream: this.config.streamPrefix(path.basename(this.folder)),
      view: this.getRelationReference(nodeId, 1),
    });
    if (this.getRelationReference(nodeId, 1) === undefined) {
      debugLog('node', node);
    }
    return node;
  }

  fileForNode(nodeId: number): string {
    // Determine in which subfolder nodeId should be located
    const subFolder: string = this.determineSubFolder(nodeId);
    debugLog(
      'subfolder for node',
      nodeId,
      'value is undefined:',
      subFolder === undefined
    );
    return path.join(this.folder, subFolder, `${nodeId}.ttl`);
  }

  determineSubFolder(nodeId: number): string {
    if (nodeId === 1) {
      return '';
    } else {
      const folderChain: string[] = [];
      let rest = nodeId;
      let divider = this.maxNodeCountPerSubFolder;
      for (let i = 1; i < this.folderDepth; i++) {
        const wholeDiv = Math.floor(rest / divider) % divider;
        const folderNumber = wholeDiv + 1;
        folderChain.unshift(folderNumber.toString());
        rest = rest - wholeDiv * this.maxNodeCountPerSubFolder;
        divider = divider * this.maxNodeCountPerSubFolder;
      }
      folderChain.unshift('');
      return path.join(...folderChain);
    }
  }

  protected getRelationReference(
    sourceNodeId: number,
    targetNodeId: number
  ): NamedNode {
    const sourceSubFolder: string = this.determineSubFolder(sourceNodeId);
    const targetSubFolder: string = this.determineSubFolder(targetNodeId);

    let relativePath = path.join(
      path.relative(sourceSubFolder, targetSubFolder),
      targetNodeId.toString()
    );
    if (!relativePath.startsWith('..')) {
      relativePath = `./${relativePath}`;
    }
    return namedNode(relativePath);
  }

  protected getViewFile() {
    return this.fileForNode(1);
  }

  protected shouldCreateNewPage(node: Node): boolean {
    return node.count >= this.maxResourcesPerPage;
  }

  abstract addMember(resource: Member): Promise<Node>;
}
