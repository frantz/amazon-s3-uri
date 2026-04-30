'use strict'

const test = require('tape')
const AmazonS3URI = require('../lib/amazon-s3-uri')
const { assert } = require('sinon')

test('invalid uri', (t) => {
  t.throws(() => {
    AmazonS3URI()
  }, TypeError, 'it should throw a TypeError')
  t.throws(() => {
    AmazonS3URI(2)
  }, TypeError, 'it should throw a TypeError')
  t.throws(() => {
    AmazonS3URI({})
  }, TypeError, 'it should throw a TypeError')
  t.throws(() => {
    AmazonS3URI('s3://')
  }, Error, 'it should throw an error')
  t.throws(() => {
    AmazonS3URI('https://')
  }, Error, 'it should throw an error')
  t.throws(() => {
    AmazonS3URI('https://aws.amazon.com')
  }, Error, 'it should throw an error')
  t.end()
})

test('it should export us-east-1 as DEFAULT_REGION', (t) => {
  t.equal(AmazonS3URI('s3://bucket').DEFAULT_REGION, 'us-east-1')
  t.end()
})

const testCases = {
  's3://bucket': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  's3://bucket/': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  's3://bucket/key': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? {} : null }
  }),
  's3://bucket/key?foo=bar&bar=foo': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? { foo: 'bar', bar: 'foo' } : 'foo=bar&bar=foo' }
  }),
  's3://bucket/key with space': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space',
    uri: { query: p ? {} : null }
  }),
  'https://s3.amazonaws.com/': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: null,
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://s3.amazonaws.com/bucket': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://s3.amazonaws.com/bucket/': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://s3.amazonaws.com/bucket/key': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? {} : null }
  }),
  'https://s3.amazonaws.com/bucket/key with space': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space',
    uri: { query: p ? {} : null }
  }),
  'https://s3-eu-west-1.amazonaws.com/bucket2/key2': (p) => ({
    isPathStyle: true,
    region: 'eu-west-1',
    bucket: 'bucket2',
    key: 'key2',
    uri: { query: p ? {} : null }
  }),
  'https://s3-eu-west-1.amazonaws.com/bucket2/key with space': (p) => ({
    isPathStyle: true,
    region: 'eu-west-1',
    bucket: 'bucket2',
    key: 'key with space',
    uri: { query: p ? {} : null }
  }),
  'https://bucket.s3.amazonaws.com': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://bucket.s3.amazonaws.com/key': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    versionId: null,
    isDualStack: false,
    uri: { query: p ? {} : null }
  }),
  'https://bucket.s3.amazonaws.com/key with space': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space',
    uri: { query: p ? {} : null }
  }),
  'http://bucket.s3-aws-region.amazonaws.com': (p) => ({
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'http://bucket.s3-aws-region.amazonaws.com/key': (p) => ({
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? {} : null }
  }),
  'http://bucket.s3-aws-region.amazonaws.com/key?foo=bar&bar=foo': (p) => ({
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? { foo: 'bar' } : 'foo=bar&bar=foo' }
  }),
  'http://bucket.s3-aws-region.amazonaws.com/key with space': (p) => ({
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: 'key with space',
    uri: { query: p ? {} : null }
  }),
  // VPCE (VPC Interface Endpoint / PrivateLink) — virtual-hosted style: bucket in host
  'https://bucket.vpce-0a1b2c3d4e5f6a7b8-a1b2c3d4.s3.us-east-1.vpce.amazonaws.com': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://bucket.vpce-0a1b2c3d4e5f6a7b8-a1b2c3d4.s3.us-east-1.vpce.amazonaws.com/key': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? {} : null }
  }),
  // VPCE — path style: bucket in path
  'https://vpce-0a1b2c3d4e5f6a7b8-a1b2c3d4.s3.us-east-1.vpce.amazonaws.com/': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: null,
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://vpce-0a1b2c3d4e5f6a7b8-a1b2c3d4.s3.us-east-1.vpce.amazonaws.com/bucket': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    uri: { query: p ? {} : null }
  }),
  'https://vpce-0a1b2c3d4e5f6a7b8-a1b2c3d4.s3.us-east-1.vpce.amazonaws.com/bucket/key': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    uri: { query: p ? {} : null }
  }),
  // dualstack endpoints
  'https://s3.dualstack.us-east-1.amazonaws.com/bucket': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    isDualStack: true,
    uri: { query: p ? {} : null }
  }),
  'https://s3.dualstack.us-east-1.amazonaws.com/bucket/key': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    isDualStack: true,
    uri: { query: p ? {} : null }
  }),
  'https://bucket.s3.dualstack.us-east-1.amazonaws.com': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null,
    isDualStack: true,
    uri: { query: p ? {} : null }
  }),
  'https://bucket.s3.dualstack.us-east-1.amazonaws.com/key': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    isDualStack: true,
    uri: { query: p ? {} : null }
  }),
  'https://s3.dualstack.eu-west-1.amazonaws.com/bucket/key': (p) => ({
    isPathStyle: true,
    region: 'eu-west-1',
    bucket: 'bucket',
    key: 'key',
    isDualStack: true,
    uri: { query: p ? {} : null }
  }),
  // versionId support
  'https://bucket.s3-eu-west-1.amazonaws.com/key?versionId=abc123': (p) => ({
    isPathStyle: false,
    region: 'eu-west-1',
    bucket: 'bucket',
    key: 'key',
    versionId: 'abc123',
    uri: { query: p ? { versionId: 'abc123' } : 'versionId=abc123' }
  }),
  'https://s3.amazonaws.com/bucket/key?versionId=v2&foo=bar': (p) => ({
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    versionId: 'v2',
    uri: { query: p ? { versionId: 'v2', foo: 'bar' } : 'versionId=v2&foo=bar' }
  }),
  's3://bucket/key?versionId=xyz': (p) => ({
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key',
    versionId: 'xyz',
    uri: { query: p ? { versionId: 'xyz' } : 'versionId=xyz' }
  })
}

Object.keys(testCases).forEach((uri) => {
  test(uri, (t) => {
    // test both values for parseQueryString
    for (const parseQueryString of [false, true]) {
      const uriObj = AmazonS3URI(uri, parseQueryString)
      const tc = testCases[uri](parseQueryString)
      assert.match(uriObj, tc)
    }
    // test default when parseQueryString is not specify
    const uriObj = AmazonS3URI(uri)
    const tc = testCases[uri](false)
    assert.match(uriObj, tc)
    t.end()
  })
})
