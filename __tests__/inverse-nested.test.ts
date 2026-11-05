import { Parser, Store } from 'n3';
import { convertToNode } from '../src/converters/node-converters';

const page = `
<http://ex.org/stream> a <http://w3id.org/ldes#EventStream>, <https://w3id.org/tree#Collection> ;
  <https://w3id.org/tree#view> <http://ex.org/stream/1> ;
  <https://w3id.org/tree#member> <http://ex.org/zitting/1>, <http://ex.org/zitting/2> .
<http://ex.org/stream/1> a <https://w3id.org/tree#Node> .
<http://ex.org/zitting/1> <http://data.vlaanderen.be/ns/besluit#behandelt> <http://ex.org/agendapunt/1> ;
  <http://data.vlaanderen.be/ns/besluit#isGehoudenDoor> <http://ex.org/orgaan/1> .
<http://ex.org/agendapunt/1> <http://purl.org/dc/terms/title> "Budget" .
<http://ex.org/behandeling/1> <http://purl.org/dc/terms/subject> <http://ex.org/agendapunt/1> ;
  <http://data.vlaanderen.be/ns/besluit#heeftStemming> <http://ex.org/stemming/1> .
<http://ex.org/stemming/1> <http://data.vlaanderen.be/ns/besluit#gevolg> "aangenomen" .
<http://ex.org/zitting/2> <http://data.vlaanderen.be/ns/besluit#isGehoudenDoor> <http://ex.org/orgaan/1> .
`;

describe('convertToNode', () => {
  it('keeps nested resources that point to their parent (inverse paths)', () => {
    const node = convertToNode(new Store(new Parser().parse(page)));
    const [first, second] = node.members;

    const subjects = new Set(first.data.getSubjects(null, null, null).map((s) => s.value));
    expect(subjects).toEqual(
      new Set([
        'http://ex.org/zitting/1',
        'http://ex.org/agendapunt/1',
        'http://ex.org/behandeling/1',
        'http://ex.org/stemming/1',
      ])
    );
    // the stream (tree:member) and the other member are not pulled in
    expect(second.data.getSubjects(null, null, null).map((s) => s.value)).toEqual([
      'http://ex.org/zitting/2',
    ]);
  });
});
