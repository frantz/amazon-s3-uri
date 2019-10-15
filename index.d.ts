interface AmazonS3URI {
    /**
     * A URI wrapper that can parse out information about an S3 URI
     *
     * @param {String} uri - the URI to parse
     * @throws {TypeError|Error}
     *
     */
    (uri: string): AmazonS3Results;
  }

  interface AmazonS3Results {
    region: string;
    bucket: string;
    key: string
  }

  declare module 'amazon-s3-uri' {
    export = AmazonS3URI;
  }

  declare var AmazonS3URI: AmazonS3URI;
