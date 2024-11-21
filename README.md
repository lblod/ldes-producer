# LDES Producer library

### Usage

`npm install @lblod/ldes-producer`

#### Get Node

```ts
import {
  getNode as getNodeFn,
  addData as addDataFn,
  getConfigFromEnv,
  ACCEPTED_CONTENT_TYPES,
} from '@lblod/ldes-producer';

const config = getConfigFromEnv();

try {
  const contentType = req.accepts(ACCEPTED_CONTENT_TYPES) || '';

  const result = await getNodeFn(config, {
    folder: req.params.folder,
    contentType: contentType,
    nodeId: parseInt(req.params.nodeId ?? '1'),
    resource: req.params[0] || '',
  });

  if (result.fromCache) {
    res.header('Cache-Control', 'public, immutable');
  }

  res.header('Content-Type', contentType);

  result.stream.pipe(res);
} catch (e) {
  return next(e);
}
```

#### Add data

```ts
try {
  const contentType = req.headers['content-type'] as string;
  await addDataFn(config, {
    contentType,
    folder: req.params.folder,
    body: req.body,
    fragmenter: req.query.fragmenter as string,
  });

  res.status(201).send();
} catch (e) {
  return next(e);
}
```

### Configuration

The following environment variables can be set:

- `BASE_URL` (required): the base-url on which this service is hosted. This ensures the service can resolve relative urls.
- `DATA_FOLDER`: the parent folder to store the LDES streams in. (default: `./data`)
- `LDES_STREAM_PREFIX`: the stream prefix to use to identify the streams. This prefix is used in conjunction with the folder name of the stream. (default: `http://mu.semte.ch/streams/`)
- `TIME_TREE_RELATION_PATH`: the path on which the relations should be defined when fragmenting resources using the time-fragmenter. This is also the predicate which is used when adding a timestamp to a new version of a resource. (default: `http://www.w3.org/ns/prov#generatedAtTime`)
- `PREFIX_TREE_RELATION_PATH`: the path on which the relations should be defined when fragmenting resources using the prefix-tree-fragmenter. (default: `https://example.org/name`)
- `CACHE_SIZE`: the maximum number of pages the cache should keep in memory. (default: `10`)
- `FOLDER_DEPTH`: the number of levels the data folder structure should contain. (default: `1`, a flat folder structure)
- `PAGE_RESOURCES_COUNT`: the number of resources (members) one page should contain. (default: `10`)
- `SUBFOLDER_NODE_COUNT`: the maximum number of nodes (pages) a subfolder should contain. (default: `10`)
- `LDES_PRODUCER_LOG_LEVEL`: if set to "debug", will log some debug informations
