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
  })
}

Object.keys(testCases).forEach((uri) => {
  test(uri, (t) => {
    // test both values for parseQueryString
    for (const parseQueryString in [false, true]) {
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
