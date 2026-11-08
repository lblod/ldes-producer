import { Fragmenter } from '../fragmenters/fragmenter';
import { Member } from './member';

export interface GetNodeOptions {
  folder: string;
  resource?: string;
  nodeId?: number;
  contentType: string;
}
export interface AddDataOptions {
  contentType?: string;
  folder: string;
  body?: any;
  members?: Member[];
  fragmenter?: string | Fragmenter | null | undefined;
  shape?: string;
}
