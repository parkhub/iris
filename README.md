# Circe

A middleware that validates Kafka topic's messages for Circe.

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
npm install @parkhub/circe
```

## Usage
It wraps [node-rdkafka] with some friendly features like [middleware execution], parsing of messages received and to protect from any future breaking changes.

Some of the options are high-level. So make sure to brush up on your [Kafka knowledge] before trying out any of those features!

## Consumer API
createConsumer({ connection, groupId, topicCfgs, globalCfgs })

 - connection(String, REQUIRED) The connection string to find the kafka
   service
 - groupId(String, REQUIRED) The [Consumer Group] this application
   belongs to.
 - topicCfgs(Object, optional) [Topic configurations] to be applied to
   any topics subscribed via this consumer.
 - globalCfgs(Object, optional) [Global configurations] to be applied to
   this consumer.
	 - DEFAULTS: { event_cb: true }

```javascript
import circe from '@parkhub/circe';

// Using async/await
(async function startConsumer() {
  const consumer = await circe.createConsumer({
    connection: 'kafka:9092',
    groupId: 'MY_GROUP_ID'
  });

  consumer.subscribe({ topic: 'MY_TOPIC' });

  const handler = message => console.log(message);
  consumer.consume({ handler });

  await consumer.disconnect();

  console.log('DONE!');
})();

// Using Promises
circe.createConsumer({ connection: 'kafka:9092', groupId: 'MY_GROUP_ID'})
  .then(consumer => {
    consumer.subscribe({ topic: 'MY_TOPIC' });

    const handler = message => console.log(message);
    consumer.consume({ handler });

    return consumer.disconnect();
  })
  .then(() => console.log('DONE!'))
  .catch(err => console.log('ERROR!', err));
```

### Consumer Client API
**subscribe({ topic })** - Will subscribe this consumer to a topic BUT WILL NOT begin consuming them. You cannot subscribe to multiple topics by calling this method more than once. You must call .unsubscribe() first.

 - **topic(String[]|String, REQUIRED)** - The topic(s) this consumer should
   subscribe to.
```javascript
consumer.subscribe({ topic: 'MY_TEST_TOPIC' });
// OR
consumer.subscribe({ topic: ['MY_TEST_TOPIC', 'MY_OTHER_TOPIC'] });
```

**consume({ handler, middleware })** - Will begin consuming the subscribed topics using the handler and middleware(if configured)

 - **handler(Function, REQUIRED)** - A function that accepts a message object that matches the [rdkafka structure] EXCEPT the "value" property which will instead be a "message" property with the Buffer from the value property already parsed. If it's a JSON string value, you will receive a JS object.
 - **middleware(Function[], optional)** - Functions that match the format of a valid [circe middleware] functions. Check out the repo for predefined middleware or create your own! (***NOTE***: The order of the middleware matters and the arity of the middleware much match the one after it) These middleware will get the MESSAGE consumed.
	 - Pre-middleware - these get applied BEFORE any of your middleware
		 - buffer to message - Transforms the value property into a message property and parses it
```javascript
const handler = (message) => console.log(message);
const middleware = [(message, next) => {
  console.log('inside middleware', message);
  next(message);
}];

consumer.consume({ handler, middleware });
```

**disconnect()** - RETURNS a PROMISE. The promise will fulfill once the client is fully disconnected.
```javascript
consumer.disconnect()
  .then(() => console.log('DISCONNECTED'))
  .catch((err) => console.log('Error disconnecting', err));
```

**unsubscribe()** - Unsubscribes from a topic(s) (***NOTE***: This only unsubscribes from the topics BUT if you were to subscribe to some other topics, IT WILL USE THE SAME HANDLER ALREADY DEFINED. This feels like a short-coming of the base library and there is [an issue] pending response. If you need to redefine a new consumer with new topics and a new handler, it's best to disconnect and create a new one consumer client.)

```javascript
consumer.subscribe({ topic: 'TOPIC' });
consumer.consume({ handler: ({ topic }) => console.log(topic) }); // Any messages to the topic are now being handled.

consumer.unsubscribe();
consumer.subscribe({ topic: 'ANOTHER_TOPIC' }); // Now the handler defined is going to only trigger for this topic!
```

**addListener(...args)** - Add a listener to this consumer. You can use any of the events available for the consumer listed in [node-rdkafka] documentation. (***NOTE***: Some of these events require a configuration setting to be set when creating your client)

```javascript
consumer.addListener('event.log', result => console.log(result));
```

## Producer API
```javascript
import circe from '@parkhub/circe';

// Using async/await
(async function startProducer() {
  const producer = await circe.createProducer({
    connection: 'kafka:9092'
  });

  producer.publish({
    publishCfgs: {
      topic: 'EXAMPLE_TOPIC',
      message: {
        test: 'message'
      }
    }
  });

  await producer.disconnect();

  console.log('DONE!');
}());

// Using Promises
circe
  .createProducer({ connection: 'kafka:9092' })
  .then((producer) => {
    producer.publish({
      publishCfgs: {
        topic: 'EXAMPLE_TOPIC',
        message: {
          test: 'message'
        }
      }
    });

    return producer.disconnect();
  })
  .then(() => console.log('DONE!'))
  .catch(err => console.log('ERROR!', err));
```

**publish({ publishCfgs, middleware })** - Publish a message to a new topic

 - **publishCfgs(Object, REQUIRED)** - Configurations used to publish your message
	 - **topic(String, REQUIRED)** - Topic to publish this message to
	 - **message(String|Object, REQUIRED)** - Message to publish
	 - **partition(number, optional)** - A specific partition for the message. 
	 - **key(String, optional)** - Specify a key for this message
	 - **timestamp(number, optional)** - Timestamp(EPOCH in milliseconds, ie Date.now()) to set for this message
	 - **opaqueToken(token, optional)** - An opaque token that gets passed along your delivery reports.
 - **middleware(Function[], optional)** - Functions that match the format of a valid [circe middleware] function. Check out the repo for predefined middleware or create your own! (***NOTE***: The order of the middleware matters and the arity of the middleware much match the one after it) These will receive the publishCfgs.
	 - Post-middleware - These get applied AFTER any defined middleware you use
		 - Message to Buffer - Transforms your message into a buffer
		 - timestamp - attaches a timestamp(if none is already defined)

```javascript
producer.publish({
  publishCfgs: {
    topic: 'TEST_TOPIC',
    message: {
      test: 'message'
    },
    timestamp: Date.now()
  },
  middleware: [(publishCfgs, next) => {
    console.log('publish configurations', publishCfgs);
    next(publishCfgs);
 }];
```

**disconnect()** - RETURNS a PROMISE. The promise will fulfill once the client is fully disconnected.
```javascript
producer.disconnect()
  .then(() => console.log('DISCONNECTED'))
  .catch((err) => console.log('Error disconnecting', err));
```

**addListener(...args)** - Add a listener to this producer. You can use any of the events available for the producer listed in [node-rdkafka] documentation. (***NOTE***: Some of these events require a configuration setting to be set when creating your client)

```javascript
producer.addListener('event.log', result => console.log(result));
```


[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[sem-release-badge]: https://github.com/semantic-release/semantic-release
[build-badge]:  https://g.codefresh.io/api/badges/build?repoOwner=parkhub&repoName=circe&branch=master&pipelineName=circe&accountName=loganbfisher&type=cf-1
[build]:  https://g.codefresh.io/repositories/parkhub/circe/builds?filter=trigger:build;branch:master;service:59c154fcde30d50001b68a79~circe
[coverage-badge]: https://img.shields.io/codecov/c/github/parkhub/circe.svg?style=flat-square
[coverage]: https://codecov.io/gh/parkhub/circe
[dependencyci-badge]: https://dependencyci.com/github/parkhub/circe/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/parkhub/circe
[version-badge]: https://img.shields.io/npm/v/@parkhub/circe.svg?style=flat-square
[package]: https://www.npmjs.com/package/@parkhub/circe
[license-badge]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license]: https://github.com/parkhub/circe/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[roadmap-badge]: https://img.shields.io/badge/%F0%9F%93%94-roadmap-CD9523.svg?style=flat-square
[roadmap]: https://github.com/parkhub/circe/blob/master/ROADMAP.md
[github-watch-badge]: https://img.shields.io/github/watchers/parkhub/circe.svg?style=social
[github-watch]: https://github.com/parkhub/circe/watchers
[github-star-badge]: https://img.shields.io/github/stars/parkhub/circe.svg?style=social
[github-star]: https://github.com/parkhub/circe/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20prettier-eslint-cli!%20https://github.com/parkhub/circe%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/parkhub/circe.svg?style=social
[semantic-release]: https://github.com/semantic-release/semantic-release
[commitizen-friendly-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[comm-friendly-badge]: http://commitizen.github.io/cz-cli/
[node-rdkafka]: https://github.com/Blizzard/node-rdkafka
[middleware execution]: https://github.com/parkhub/circe-middleware
[Consumer group]: https://kafka.apache.org/documentation/#gettingStarted
[Topic configurations]: https://github.com/edenhill/librdkafka/blob/0.9.5.x/CONFIGURATION.md#topic-configuration-properties
[Global configurations]: https://github.com/edenhill/librdkafka/blob/0.9.5.x/CONFIGURATION.md#global-configuration-properties
[rdkafka structure]: https://github.com/Blizzard/node-rdkafka#message-structure
[circe middleware]: https://github.com/parkhub/circe-middleware
[an issue]: https://github.com/Blizzard/node-rdkafka/issues/251
[Kafka knowledge]: https://kafka.apache.org/documentation/


