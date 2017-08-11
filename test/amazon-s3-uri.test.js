'use strict'

const test = require('tape')
const AmazonS3URI = require('../lib/amazon-s3-uri')

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
  's3://bucket': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null
  },
  's3://bucket/': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null
  },
  's3://bucket/key': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key'
  },
  's3://bucket/key with space': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space'
  },
  'https://s3.amazonaws.com/': {
    isPathStyle: true,
    region: 'us-east-1',
    bucket: null,
    key: null
  },
  'https://s3.amazonaws.com/bucket': {
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null
  },
  'https://s3.amazonaws.com/bucket/': {
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null
  },
  'https://s3.amazonaws.com/bucket/key': {
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key'
  },
  'https://s3.amazonaws.com/bucket/key with space': {
    isPathStyle: true,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space'
  },
  'https://s3-eu-west-1.amazonaws.com/bucket2/key2': {
    isPathStyle: true,
    region: 'eu-west-1',
    bucket: 'bucket2',
    key: 'key2'
  },
  'https://s3-eu-west-1.amazonaws.com/bucket2/key with space': {
    isPathStyle: true,
    region: 'eu-west-1',
    bucket: 'bucket2',
    key: 'key with space'
  },
  'https://bucket.s3.amazonaws.com': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: null
  },
  'https://bucket.s3.amazonaws.com/key': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key'
  },
  'https://bucket.s3.amazonaws.com/key with space': {
    isPathStyle: false,
    region: 'us-east-1',
    bucket: 'bucket',
    key: 'key with space'
  },
  'http://bucket.s3-aws-region.amazonaws.com': {
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: null
  },
  'http://bucket.s3-aws-region.amazonaws.com/key': {
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: 'key'
  },
  'http://bucket.s3-aws-region.amazonaws.com/key with space': {
    isPathStyle: false,
    region: 'aws-region',
    bucket: 'bucket',
    key: 'key with space'
  }
}

Object.keys(testCases).forEach((uri) => {
  test(uri, (t) => {
    const uriObj = AmazonS3URI(uri)
    const tc = testCases[uri]
    Object.keys(tc).forEach((k) => {
      t.equal(uriObj[k], tc[k], k)
    })
    t.end()
  })
})
