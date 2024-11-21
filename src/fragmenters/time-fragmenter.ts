import { DataFactory } from 'n3';
import path from 'path';
import {
  generateTreeRelation,
  generateVersion,
  getFirstMatch,
  nowLiteral,
} from '../utils/utils';
import { Fragmenter, FragmenterArgs } from './fragmenter';

const { namedNode, quad } = DataFactory;

import { PURL, TREE } from '../utils/namespaces';
import { Node } from '../models/node';
import { Relation } from '../models/relation';
import * as RDF from '@rdfjs/types';
import { Member } from '../models/member';
import { Config } from '../models/config';

export default class TimeFragmenter extends Fragmenter {
  relationPath: RDF.NamedNode<string>;
  constructor(config: Config, args: FragmenterArgs) {
    super(config, args);
    this.relationPath = namedNode(config.timeTreeRelationPath);
  }

  constructNewNode(): Node {
    const nodeId = (this.config.cache.getLastPage(this.folder) || 0) + 1;
    this.config.cache.updateLastPage(this.folder, nodeId);

    const node = new Node({
      id: nodeId,
      stream: this.config.streamPrefix(path.basename(this.folder)),
      view: this.getRelationReference(nodeId, 1),
      timestampPath: this.relationPath,
      versionOfPath: PURL('isVersionOf'),
    });
    return node;
  }

  constructVersionedMember(member: Member): Member {
    const versionedResourceId = generateVersion(member.id);
    const versionedMember = new Member(versionedResourceId);
    member.data.forEach(
      (quadObj) => {
        if (quadObj.subject.equals(member.id)) {
          versionedMember.addQuads(
            quad(
              versionedResourceId,
              quadObj.predicate,
              quadObj.object,
              quadObj.graph
            )
          );
        } else {
          versionedMember.addQuads(quadObj);
        }
      },
      null,
      null,
      null,
      null
    );

    const dateLiteral = nowLiteral();

    // add resources about this version
    versionedMember.addQuads(
      quad(versionedMember.id, PURL('isVersionOf'), member.id),
      quad(versionedMember.id, this.relationPath, dateLiteral)
    );

    return versionedMember;
  }

  async closeNode(node: Node, timestamp: RDF.Literal): Promise<Node> {
    const currentNode = this.constructNewNode();
    node.add_relation(
      new Relation(
        generateTreeRelation(),
        TREE('GreaterThanOrEqualToRelation'),
        timestamp,
        this.getRelationReference(node.metadata.id, currentNode.metadata.id),
        currentNode.metadata.id,
        this.relationPath
      )
    );
    this.config.cache.addNode(
      this.fileForNode(currentNode.metadata.id),
      currentNode
    );
    return currentNode;
  }

  async addVersionedMember(versionedMember: Member): Promise<Node> {
    const lastPageNr = this.config.cache.getLastPage(this.folder);
    let currentNode: Node;
    let pageFile;
    if (lastPageNr) {
      pageFile = this.fileForNode(lastPageNr);
      currentNode = await this.config.cache.getNode(pageFile);
    } else {
      currentNode = this.constructNewNode();
      pageFile = this.fileForNode(currentNode.metadata.id);
      this.config.cache.addNode(pageFile, currentNode);
    }

    // let currentDataset = await createStore(readTriplesStream(pageFile));

    if (this.shouldCreateNewPage(currentNode)) {
      const closingNode = currentNode;
      const timestampLastMember = getFirstMatch(
        versionedMember.data,
        versionedMember.id,
        this.relationPath
      )!.object;
      // create a store with the new graph for the new file
      currentNode = await this.closeNode(
        closingNode,
        timestampLastMember as RDF.Literal
      );
    }
    currentNode.add_member(versionedMember);
    return currentNode;
  }

  async addMember(resource: Member): Promise<Node> {
    const versionedResource: Member = this.constructVersionedMember(resource);
    const lastDataset = await this.addVersionedMember(versionedResource);
    return lastDataset;
  }
}
