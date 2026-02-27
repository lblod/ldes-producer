import namespace from '@rdfjs/namespace';
import testData from './addNode-data';
import { readFile, rm } from 'fs/promises';
process.env.BASE_URL = 'http://example.com';
const OUT_TEST_FOLDER = '__test__out';
let mockedUuid: number;
jest.mock('uuid', () => {
  return {
    v4: () => ++mockedUuid + '',
  };
});

beforeEach(async () => {
  await rm(OUT_TEST_FOLDER, { recursive: true, force: true });
  mockedUuid = 0;
  jest.resetModules();
});

describe('addNode', () => {
  it('should add triples to the stream without throwing any errors', async () => {
    const { addData, getConfigFromEnv,  } = await import('../src');
    const config = getConfigFromEnv();
    config.baseFolder = OUT_TEST_FOLDER;
    const data = testData.join('\n');
    for (let i = 0; i < 100; i++)
      await expect(
        addData(config, {
          body: data,
          folder: 'ldes-mow-register',
          contentType: 'text/turtle',
          fragmenter: 'time-fragmenter',
        })
      ).resolves.not.toThrow();
  });

  it('should add triples to the stream', async () => {
    const { addData, getConfigFromEnv,  } = await import('../src');
    const { difference } = require('rdf-tortank-glibc');
    const config = getConfigFromEnv();
    config.baseFolder = OUT_TEST_FOLDER;
    const data = testData.join('\n');
    const mockDate = new Date('2024-11-22T07:12:35.573Z');
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await addData(config, {
      body: data,
      folder: 'ldes-mow-register',
      contentType: 'text/turtle',
      fragmenter: 'time-fragmenter',
    });
    const paramsForDiff = {
      lhsPath: `${OUT_TEST_FOLDER}/ldes-mow-register/1.ttl`,
      rhsPath: `${__dirname}/addNode-expected-result.ttl`,
      outputType: 'json',
    };
    expect(difference(paramsForDiff)).toEqual([]);
    spy.mockRestore();
  });
  it('should add triples to the stream with correct ldes prefix', async () => {
    process.env.USE_CORRECT_LDES_NAMESPACE='true';
    const { addData, getConfigFromEnv,  } = await import('../src');

    const { difference } = require('rdf-tortank-glibc');
    const config = getConfigFromEnv();
    config.baseFolder = OUT_TEST_FOLDER;
    const mockDate = new Date('2024-11-22T07:12:35.573Z');
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await addData(config, {
      body: '<http://x.com/x> <http://x.com/y> <http://x.com/z>.',
      folder: 'ldes-mow-register',
      contentType: 'text/turtle',
      fragmenter: 'time-fragmenter',
    });
    const paramsForDiff = {
      lhsPath: `${OUT_TEST_FOLDER}/ldes-mow-register/1.ttl`,
      rhsPath: `${__dirname}/addNode-expected-result-correct-prefix.ttl`,
      outputType: 'json',
    };
    expect(difference(paramsForDiff)).toEqual([]);
    spy.mockRestore();
  });
});
