# AmazonS3URI

[![Actions Status](https://github.com/frantz/amazon-s3-uri/workflows/test/badge.svg)](https://github.com/frantz/amazon-s3-uri/actions)
[![codecov](https://codecov.io/gh/frantz/amazon-s3-uri/branch/master/graph/badge.svg)](https://codecov.io/gh/frantz/amazon-s3-uri)

A URI wrapper that can parse out information about an S3 URI.

Adapted from the [AWS Java SDK `AmazonS3URI`](https://github.com/aws/aws-sdk-java/blob/master/aws-java-sdk-s3/src/main/java/com/amazonaws/services/s3/AmazonS3URI.java), with the following differences:

- There is no preprocessing on the given URI string — encode special characters yourself if needed
- `region` is never `null` for a valid S3 URI; it defaults to `us-east-1`

## Install

```sh
npm install amazon-s3-uri
```

## Usage

```js
const AmazonS3URI = require("amazon-s3-uri");

const { region, bucket, key, isPathStyle, isDualStack, versionId } =
  AmazonS3URI("https://bucket.s3.dualstack.us-east-1.amazonaws.com/key");
// region      → 'us-east-1'
// bucket      → 'bucket'
// key         → 'key'
// isPathStyle → false
// isDualStack → true
// versionId   → null
```

Works both as a constructor and as a plain function call:

```js
const a = new AmazonS3URI("s3://bucket/key"); // constructor
const b = AmazonS3URI("s3://bucket/key");     // functional — returns a new instance
```

Throws `TypeError` for non-string input and `Error` for URIs that cannot be parsed as S3 endpoints.

## Parsed properties

| Property      | Type             | Description |
|---------------|------------------|-------------|
| `bucket`      | `string \| null` | Bucket name, or `null` if not present |
| `key`         | `string \| null` | Object key, or `null` if not present |
| `region`      | `string`         | AWS region; defaults to `us-east-1` |
| `isPathStyle` | `boolean`        | `true` when the bucket is in the path rather than the hostname |
| `isDualStack` | `boolean`        | `true` when the URI uses an S3 dualstack endpoint |
| `versionId`   | `string \| null` | Value of the `versionId` query parameter, or `null` |
| `uri`         | `object`         | Parsed URL components (`protocol`, `host`, `pathname`, `search`, `query`, `href`, …) |

## Supported URI formats

```
s3://bucket/key
https://s3.amazonaws.com/bucket/key                           (path-style, global)
https://s3-eu-west-1.amazonaws.com/bucket/key                 (path-style, regional)
https://s3.us-east-1.amazonaws.com/bucket/key                 (path-style, regional)
https://s3.dualstack.us-east-1.amazonaws.com/bucket/key       (path-style, dualstack)
https://bucket.s3.amazonaws.com/key                           (virtual-hosted, global)
https://bucket.s3-eu-west-1.amazonaws.com/key                 (virtual-hosted, regional)
https://bucket.s3.dualstack.us-east-1.amazonaws.com/key       (virtual-hosted, dualstack)
https://bucket.vpce-xxx.s3.us-east-1.vpce.amazonaws.com/key  (VPCE virtual-hosted)
https://vpce-xxx.s3.us-east-1.vpce.amazonaws.com/bucket/key  (VPCE path-style)
```

## `parseQueryString` option

Pass `true` as the second argument to expose `uri.query` as a parsed object instead of a raw string:

```js
const { uri, versionId } = AmazonS3URI(
  "https://bucket.s3.amazonaws.com/key?versionId=abc123",
  true
);
// uri.query → { versionId: 'abc123' }
// versionId → 'abc123'
```

## License

MIT
