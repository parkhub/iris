# iris
> Kafka and Avro mashup

A kafka library that is meant to validate produced messages and decode consumed messages using schemas defined in Confluent's [Schema Registry].

It uses the excellent [node-rdkafka] library under the hood by wrapping a producer's produce method or a consumer's consume method with encodings that work with a schema registry backed Kafka deployment. It uses [avsc] to handle avro encoding/decoding of JSON messages.


[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![Apache License][license-badge]][LICENSE]
[![PRs Welcome][prs-badge]][prs]
[![Roadmap][roadmap-badge]][roadmap]
[![Semantic Release][semantic-release-badge]][sem-release-badge]
[![Commitizen][commitizen-friendly-badge]][comm-friendly-badge]


[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## Install
```bash
npm install @parkhub/iris
```

## Usage
Give it the url for your schema registry, initialize it and create clients!

Make sure to brush up on your [Kafka knowledge] before tweaking with producers/consumers options!

```javascript
import iris from '@parkhub/iris';

const registryUrl = 'http://registry:8081';
const brokerList = 'kafka-1:9092,kafka-2:9092';
const schemaCfgs = [
  {
    topic: 'TestTopic'
  }, {
   topic: 'OtherTopic'
   version: '1.2'
   }
];
async function startApp() {
  const kafka = await iris({ registryUrl, brokerList, SchemaCfgs })
	  .initialize();

  const consumer = await kafka.createConsumer({
    groupId: 'consumer-group',
    topicCfgs: {
      'consume.callback.max.messages': 100
    }
  }).connect();

  consumer.subscribe(['TestTopic'], (data) => {
    const { message, topic, schemaId } = data;
    console.log('Message received', JSON.stringify(message, null, 4));
    console.log('Message from topic', topic);
    console.log('SchemaId used to parse message', schemaId);
  });

  const producer = await kafka.createProducer({
    'client.id': 'kafka',
    'dr_cb': true
  }).connect();


  const message = {
    name: 'satsuki',
    age: 19
  };

  producer.produce('TestTopic', null, message);

  return kafka;
}

startApp()
  .then(async (kafka) => {
    kafka.disconnectAllClients();
  })
  .catch(err => console.error(err));

```

# API
The API for Iris clients follows pretty closely to those of [node-rdkafka] with the exception of a few methods that have been promisified!

These methods for both Producers/Consumers are:

 - getMetadata
 - connect
 - disconnect

They take the same configurations as described in the [node-rdkafka api docs] except the callback if you're using the promise API.

HOWEVER, due to node-rdkafka using its methods to do some internal magic, you also have the option of using the callback API. Just pass in the callback along with each method's arguments.

All producer/consumer clients listen to the same events, take the same configurations(with a few exceptions listed below) and behave the same way. Make sure to take a look at [node-rdkafka] configurations for more detail!


## Consumer API
createConsumer({ groupId, [Kafka Consumer Configurations], topicCfgs(valid [Kafka Consumer Topic Configurations]) })


### Differences
This method follows closely with [Kafka Consumer Configurations] except that groupId is used here instead of 'group.id' Any other valid configuration can be passed to the Consumer by following the same semantics used in [node-rdkafka] configurations. And the same applies for topicCfgs Object and topic configurations.

Only the [standard consumer api] is supported at the moment. I've also joined the "subscribe" process so subscribe actually takes an array of topics and the handler. So you don't need to call subscribe, then consume then listen on 'data' event. Everything is done when you call the subscribe method.

A consumer handler will receive the following structure:

```javascript
{
  message: 'Decoded Message',
  topic: 'Topic the message came from',
  schemaId: 'The schemaId used to encode the topic',
  key: 'Key for this kafka topic',
  size: 'Size of message in bytes',
  partition: 'Partition the message was on',
  offset: 'Offset the message was read from'
}
```

```javascript
import iris from '@parkhub/iris';

// Using async/await
(async function startConsumer() {
  const consumer = iris.createConsumer({
    groupId: 'consumer-group',
    topicCfgs: {
      'consume.callback.max.messages': 100
    }
  });

  await consumer.connect();

  const handler = data => console.log(data);
  consumer.subscribe(['MY_TOPIC'], handler);

  console.log('DONE!');
})();

// Using Promises
iris.createConsumer({ connection: 'kafka:9092', groupId: 'MY_GROUP_ID'})
  .then(consumer => {
    const handler = message => console.log(message);
    consumer.subscribe(['MY_TOPIC'], handler);
  })
  .then(() => console.log('DONE!'))
  .catch(err => console.log('ERROR!', err));
```


## Producer API
createProducer([Kafka Producer Configurations])

### Differences
The only difference is that iris' only supports [standard-api producer] clients. Everything else remains the same.

```javascript
import iris from '@parkhub/iris';

// Using async/await
(async function startProducer() {
  const producer = await iris.createProducer({
    'client.id': 'kafka',
    'dr_cb': true
  });

  await producer.connect();

  producer.produce('TestTopic', null, 'message');

  await producer.disconnect();

  console.log('DONE!');
}());

// Using Promises
iris
  .createProducer({ 'client.id': 'kafka:9092', dr_cb: true })
  .then((producer) => {
    producer.produce('TestTopic', null, 'message');

    return producer.disconnect();
  })
  .then(() => console.log('DONE!'))
  .catch(err => console.log('ERROR!', err));
```

[Kafka Producer configurations]: https://github.com/Blizzard/node-rdkafka#sending-messages
[standard-producer api]: https://github.com/Blizzard/node-rdkafka#standard-api
[standard-consumer api]: https://github.com/Blizzard/node-rdkafka#standard-api-1
[node-rdkafka api docs]: https://blizzard.github.io/node-rdkafka/current/
[Kafka Consumer Topic Configurations]: https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md#topic-configuration-properties
[Kafka Consumer Configurations]: https://github.com/Blizzard/node-rdkafka#kafkakafkaconsumer
[avsc]: https://github.com/mtth/avsc
[Schema Registry]: https://docs.confluent.io/current/schema-registry/docs/index.html
[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[sem-release-badge]: https://github.com/semantic-release/semantic-release
[build-badge]:  https://g.codefresh.io/api/badges/build?repoOwner=parkhub&repoName=iris&branch=master&pipelineName=iris&accountName=loganbfisher&type=cf-1
[build]:  https://g.codefresh.io/repositories/parkhub/iris/builds?filter=trigger:build;branch:master;service:59c154fcde30d50001b68a79~iris
[coverage-badge]: https://img.shields.io/codecov/c/github/parkhub/iris.svg?style=flat-square
[coverage]: https://codecov.io/gh/parkhub/iris
[dependencyci-badge]: https://dependencyci.com/github/parkhub/iris/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/parkhub/iris
[version-badge]: https://img.shields.io/npm/v/@parkhub/iris.svg?style=flat-square
[package]: https://www.npmjs.com/package/@parkhub/iris
[license-badge]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license]: https://github.com/parkhub/iris/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[roadmap-badge]: https://img.shields.io/badge/%F0%9F%93%94-roadmap-CD9523.svg?style=flat-square
[roadmap]: https://github.com/parkhub/iris/blob/master/ROADMAP.md
[github-watch-badge]: https://img.shields.io/github/watchers/parkhub/iris.svg?style=social
[github-watch]: https://github.com/parkhub/iris/watchers
[github-star-badge]: https://img.shields.io/github/stars/parkhub/iris.svg?style=social
[github-star]: https://github.com/parkhub/iris/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20prettier-eslint-cli!%20https://github.com/parkhub/iris%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/parkhub/iris.svg?style=social
[semantic-release]: https://github.com/semantic-release/semantic-release
[commitizen-friendly-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[comm-friendly-badge]: http://commitizen.github.io/cz-cli/
[node-rdkafka]: https://github.com/Blizzard/node-rdkafka
[Kafka knowledge]: https://kafka.apache.org/documentation/
---
## Development Guide
In this section you will be able to find out how to get started developing for iris.

### Requirements
* Must have the latest version of Docker installed.

### Downloading
`git clone git@github.com:parkhub/iris.git`

### Building
`docker-compose up iris-integration`

### Running Tests
##### Integration Tests
When you run `docker-compose up iris-integration` it will actually run the integration tests.  As you make changes to the project the tests will rerun.

##### Unit Tests
To run the unit test simply make sure to install the packages locally by running `npm start`.  Then all you need to do is run the test command.

`npm start test`

### Creating a Commit
We use [semantic-release](https://github.com/semantic-release/semantic-release) to manage our releases.  If you haven\'t worked with it before please take a look at their project to understand more about how it works.

1. First I like to run the validate command before running through the commit process because if it fails on validation when your committing then you will have to go through the commit process again.  To run the validate command simply run this:

    `npm start validate`

2. To start a new release, make sure you have added your files to git and then run this command:

    `npm start commit`

    This will take you through the release process.  Follow the directions and read the steps throughly.  

3. After you have committed your code and it passes the linter then you can push your branch up to Github and create a pull request.
