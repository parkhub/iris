const kafka = require('node-rdkafka');

const producer = new kafka.Producer({
  'metadata.broker.list': 'kafka:9092',
  'api.version.request': true
});

const testMsg = {
  name: 1,
  number1: 123,
  number2: 123.4
};

producer.connect();

producer.on('ready', () => {
  producer.queryWatermarkOffsets('topico', null, null, (err, offsets) => {
    console.log('offsets', offsets);
  });
  // console.log('CONNECTED');
  //
  // try {
  //   setInterval(() => {
  //     console.log('producing!');
  //     try {
  //       producer.produce('topico', null, msg)
  //     } catch(e) {
  //       console.log('error', e);
  //     };
  //   }, 5000);
  //
  // } catch(e) {
  //   console.error('ERROR FROM PRODUCER')
  //   console.error(err);
  // }
});

producer.on('event', (err) => {
  console.log('event');
  console.log(err);
});
producer.on('event.log', (err) => {
  console.log('event.log');
  console.log(err);
});

producer.on('event.error', (err) => {
  console.error('ERROR FROM event ');
  console.error(err);
});
