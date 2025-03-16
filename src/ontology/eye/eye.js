const fs = require('node:fs');
const path = require('node:path');
const querystring = require('node:querystring');

const SERVER_URL = 'https://eye.restdesc.org/'

// Combine input data with fixed rules and send POST request to EYE server
async function handleRequest(query, data) {
  const body = querystring.stringify({ query, data });
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  return response.text();
}

// Read the file paths from CLI
const args = process.argv.slice(2);

// Read input files, combine them with stored rules, and send to server
Promise.all(args.map(file => fs.promises.readFile(file, { encoding: 'utf8' })))
  .then(async files => {
    const [query, ...documents] = files;
    const result = await handleRequest(query, documents);
    if (result.trim().length === 0) {
      console.error('No results');
    } else {
      console.log(result);
    }
  });
