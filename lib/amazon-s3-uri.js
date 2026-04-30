// @ts-check
'use strict'

const url = require('url')

const ENDPOINT_PATTERN = /^(.+\.)?s3[.-](?:dualstack\.)?([a-z0-9-]+)\./
const DEFAULT_REGION = 'us-east-1'

/**
 * A URI wrapper that can parse out information about an S3 URI
 *
 * @example <caption>instanciate AmazonS3URI</caption>
 * try {
 *  const uri = 'https://bucket.s3-aws-region.amazonaws.com/key'
 *  const { region, bucket, key } = new AmazonS3URI(uri)
 * } catch (err) {
 *  console.warn(`${uri} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
 * }
 * @example <caption>functional interface: it automatically returns an AmazonS3URI instance</caption>
 *  const { region, bucket, key } = AmazonS3URI(uri)
 * @param {string} uri - the URI to parse
 * @param {boolean} [parseQueryString] - If true, `uri` property exposes `query` as an object instead of a string
 * @throws {TypeError|Error}
 */
function AmazonS3URI (uri, parseQueryString) {
  if (new.target === undefined) {
    return new AmazonS3URI(uri, parseQueryString)
  }
  if (typeof uri !== 'string') {
    throw new TypeError(`uri must be a string, got ${typeof uri}`)
  }
  /**
   * URL object from `url.parse`
   * @type { import('url').Url }
   * */
  this.uri = url.parse(uri, !!parseQueryString) // eslint-disable-line n/no-deprecated-api -- TODO: migrate to URL constructor in next major version (breaking: changes uri property type)
  /**
   * the bucket name parsed from the URI (or null if no bucket specified)
   * @type { string | null }
   * */
  this.bucket = null
  /**
   * the region parsed from the URI (or `DEFAULT_REGION`)
   * @type { string }
   * */
  this.region = DEFAULT_REGION
  /**
   * the key parsed from the URI (or null if no key specified)
   * @type {string | null}
   * */
  this.key = null
  /**
   * true if the URI contains the bucket in the path,
   * false if it contains the bucket in the authority
   * @type { boolean }
   * */
  this.isPathStyle = false
  /**
   * true if the URI uses an S3 dualstack endpoint
   * @type {boolean}
   */
  this.isDualStack = false
  /**
   * the version ID parsed from the versionId query parameter (or null if not specified)
   * @type {string | null}
   */
  this.versionId = parseQueryString && typeof this.uri.query === 'object' && this.uri.query !== null
    ? (typeof this.uri.query.versionId === 'string' ? this.uri.query.versionId : null)
    : (this.uri.search ? new URLSearchParams(this.uri.search).get('versionId') : null)

  if (this.uri.protocol === 's3:') {
    this.bucket = this.uri.host

    if (!this.bucket) {
      throw new Error(`Invalid S3 URI: no bucket: ${uri}`)
    }

    if (!this.uri.pathname || this.uri.pathname.length <= 1) {
      // s3://bucket or s3://bucket/
      this.key = null
    } else {
      // s3://bucket/key
      // Remove the leading '/'.
      this.key = this.uri.pathname.substring(1)
    }
    if (this.key !== null) {
      this.key = decodeURIComponent(this.key)
    }
    return
  }

  if (!this.uri.host) {
    throw new Error(`Invalid S3 URI: no hostname: ${uri}`)
  }

  const matches = this.uri.host.match(ENDPOINT_PATTERN)
  if (!matches) {
    throw new Error(`Invalid S3 URI: hostname does not appear to be a valid S3 endpoint: ${uri}`)
  }

  this.isDualStack = /\.dualstack\./.test(this.uri.host)

  const prefix = matches[1]
  // A VPCE path-style endpoint has the vpce-id as the host prefix with no bucket, e.g.
  // vpce-<id>-<suffix>.s3.<region>.vpce.amazonaws.com/<bucket>/<key>
  const isVpcePathStyle = prefix !== undefined && /^vpce-[a-z0-9-]+\.$/.test(prefix)
  if (!prefix || isVpcePathStyle) {
    // No bucket name in the host; parse it from the path.
    this.isPathStyle = true

    if (!this.uri.pathname || this.uri.pathname === '/') {
      this.bucket = null
      this.key = null
    } else {
      const index = this.uri.pathname.indexOf('/', 1)
      if (index === -1) {
        // https://s3.amazonaws.com/bucket
        this.bucket = this.uri.pathname.substring(1)
        this.key = null
      } else if (index === this.uri.pathname.length - 1) {
        // https://s3.amazonaws.com/bucket/
        this.bucket = this.uri.pathname.substring(1, index)
        this.key = null
      } else {
        // https://s3.amazonaws.com/bucket/key
        this.bucket = this.uri.pathname.substring(1, index)
        this.key = this.uri.pathname.substring(index + 1)
      }
    }
  } else {
    // Bucket name was found in the host; path is the key.
    // Remove the trailing '.' from the prefix to get the bucket.
    // For VPCE virtual-hosted URLs (bucket.vpce-<id>-<suffix>.s3…) strip the vpce suffix.
    const rawPrefix = prefix.substring(0, prefix.length - 1)
    const vpceIdx = rawPrefix.indexOf('.vpce-')
    this.bucket = vpceIdx !== -1 ? rawPrefix.substring(0, vpceIdx) : rawPrefix

    if (!this.uri.pathname || this.uri.pathname === '/') {
      this.key = null
    } else {
      // Remove the leading '/'.
      this.key = this.uri.pathname.substring(1)
    }
  }

  if (matches[2] !== 'amazonaws') {
    this.region = matches[2]
  } else {
    this.region = DEFAULT_REGION
  }

  if (this.key !== null) {
    this.key = decodeURIComponent(this.key)
  }
}

/**
 * @constant
 * @default 'us-east-1'
 */
AmazonS3URI.prototype.DEFAULT_REGION = DEFAULT_REGION

exports = module.exports = AmazonS3URI
