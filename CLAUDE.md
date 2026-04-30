# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm test          # lint (standard) + run tests (tape) + generate lcov coverage report
```

To run a single test by name, use `tape` directly and grep:

```sh
npx tape 'test/**/*.test.js' | grep -A5 "<test name>"
```

To regenerate `index.d.ts` from JSDoc annotations in `lib/amazon-s3-uri.js`:

```sh
npm run generate-types
```

## Architecture

This is a single-file Node.js library (`lib/amazon-s3-uri.js`) with no runtime dependencies.

**`AmazonS3URI(uri, parseQueryString?)`** — works both as a constructor (`new AmazonS3URI(...)`) and as a plain function call (returns a new instance via `new.target` detection). It parses an S3 URI into these properties:

- `bucket` — bucket name, or `null`
- `key` — object key, or `null`
- `region` — AWS region string, defaults to `us-east-1`
- `isPathStyle` — `true` when bucket is in the path rather than the hostname
- `isDualStack` — `true` when the hostname contains `.dualstack.`
- `versionId` — value of the `versionId` query parameter, or `null`
- `uri` — parsed URL components object (`protocol`, `host`, `hostname`, `port`, `pathname`, `search`, `query`, `path`, `hash`, `href`, `auth`, `slashes`); `query` is an object when `parseQueryString` is `true`, a raw string otherwise

**URL format detection** uses `ENDPOINT_PATTERN` (`/^(.+\.)?s3[.-](?:dualstack\.)?([a-z0-9-]+)\./`) against the hostname to distinguish:

1. `s3://` protocol — bucket is the host, key is the path
2. Path-style HTTP(S) — no host prefix before `s3`, or a VPCE path-style host (`vpce-<id>-<suffix>.s3…`) — bucket and key come from the path
3. Virtual-hosted HTTP(S) — bucket is the subdomain prefix; handles VPCE virtual-hosted style (`bucket.vpce-<id>-<suffix>.s3…`) by stripping the `.vpce-…` suffix

Region is extracted from the second capture group of `ENDPOINT_PATTERN`; if it equals `'amazonaws'` (global endpoint), region falls back to `us-east-1`.

**Linting**: `standard` (no config file — uses its defaults). Code must pass `standard ./lib` before tests run.

**Tests**: `tape` with `sinon`'s `assert.match` for structural assertions. All URI variants are defined in a `testCases` map and iterated automatically, testing both `parseQueryString` values.

**TypeScript types**: `index.d.ts` is generated via `tsc` from JSDoc annotations in the source. The `tsconfig.json` drives this — edit JSDoc in `lib/amazon-s3-uri.js` and regenerate rather than editing `index.d.ts` directly.
