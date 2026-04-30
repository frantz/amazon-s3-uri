## v1.0.0 (2026-04-30)

**Breaking changes (from 0.x):**
- `uri.pathname` is now percent-encoded for inputs with raw special characters (e.g. spaces become `%20`). The `key` property is unaffected — it always applies `decodeURIComponent`.
- The TypeScript type of `uri` changed from `import("url").Url` to a plain object shape (`{ protocol, host, pathname, search, query, href, … }`).

**Internal:**
- Replaced deprecated `url.parse` with the WHATWG `URL` constructor (#360)

## v0.3.0 (2026-04-30)
- feat: add dualstack endpoint support and `isDualStack` property (#355)
- feat: VPCE (VPC Interface Endpoint / PrivateLink) virtual-hosted and path-style support
- fix: explicit `TypeError` guard for non-string `uri` input (#357)
- fix: `versionId` preserves empty string values (uses `??` not `||`) (#358)
- fix: guard `versionId` query access for TypeScript 6 strict null checks (#359)
- chore: remove stale URI encoding TODO (#356)

## v0.2.0 (2024-01-01)
- feat: add `versionId` property parsed from `versionId` query parameter (#354)

## v0.1.0 (2020-10-03)
- fix: remove query params from key and introduce optional parameter to parse query (#14)
- chore: generate index.d.ts from JSDoc annotations (#13)
- chore: drop support for Node < v8
- Fix prefix operator error on react native (#5)
- Fix README example (#2)

## v0.0.3 (2017-08-11)
- Add support for keys that include spaces. (#1)
