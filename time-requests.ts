import fetch from 'node-fetch';
import fs from 'fs';
let url = 'https://app-gateway-poc-production.up.railway.app/app-gateway-service/delay-service/delay';

let options = {
  method: 'GET',
  headers: {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uQ2xhaW1zIjp7InNlc3Npb25JZCI6IjM4OWQ3NTg5LTIxZTMtNDhkMi1hNmY3LTMwOTQwNWUzNjE5MyIsImFjdGl2aXR5RXh0ZW5zaW9uSW5NcyI6NjAwMDAwMH0sImlzcyI6Im1lIn0.VPN276a2qIFHcPO8dLQ-ItYe8u8AP5KTjw6JFSlwSA4'
  }
};

const requestCount = 1000;

var elapsed_time = function (start: any) {
  const end = process.hrtime(start);
  const elapsed = end[0] * 1000 + end[1] / 1000000;
  return elapsed;
};

const makeRequest = async (index: number) => {
  try {
    const response = await fetch(url, options);
    if (index % 100 === 0) {
      console.log(`Request ${index} done, status: ${response.status} ${await response.text()}`);
    }
  } catch (e) {
    console.error(e);
  }
};

const run = async () => {
  const timings = await Promise.all(
    [...Array(requestCount).keys()].map(async index => {
      const startTime = process.hrtime();
      await makeRequest(index);
      return elapsed_time(startTime);
    })
  );
  return timings;
};

run().then(timings => fs.writeFileSync('timings.json', JSON.stringify(timings)));
