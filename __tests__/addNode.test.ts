import { addData, getConfigFromEnv } from '../src';
import testData from './addNode-data';
import { rm } from 'fs/promises';
describe('addNode', () => {
  it.only('should add triples to the stream', async () => {
    await rm('__test__out', { recursive: true, force: true });
    const config = getConfigFromEnv();
    config.baseFolder = '__test__out';
    const data = testData.join('\n');
    for (let i = 0; i < 100; i++)
      await addData(config, {
        body: data,
        folder: 'ldes-mow-register',
        contentType: 'text/turtle',
        fragmenter: 'time-fragmenter',
      });
  });
});
