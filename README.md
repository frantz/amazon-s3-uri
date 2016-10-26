# AmazonS3URI

[![CircleCI](https://circleci.com/gh/frantz/amazon-s3-uri.svg?style=svg)](https://circleci.com/gh/frantz/amazon-s3-uri)

A URI wrapper that can parse out information about an S3 URI

Shamelessly adapted from https://github.com/aws/aws-sdk-java/blob/master/aws-java-sdk-s3/src/main/java/com/amazonaws/services/s3/AmazonS3URI.java

with notable exceptions:

- it doesn't parse `version`
- There is no preprocessing on given `url` string (you have to encode and replace special characters yourself if needed)
- For a valid S3 uri, `region` is never `null` but will default to `us-east-1`

# example
```js
const AmazonS3URI = require('amazon-s3-uri')

try {
  const uri = 'https://bucket.s3-aws-region.amazonaws.com/key'
  const { region, bucket, key } = AmazonS3URI(uri)
} catch((err) => {
  console.warn(`${uri} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
})
```
# license

MIT
