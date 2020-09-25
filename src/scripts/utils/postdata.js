import 'isomorphic-fetch'

function _postData(data, url) {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  })
    .then(function (response) {
      if (response.status !== 200) {
        console.log('There was an issue: ' + response.status)
      } else {
        console.log('No issues ;)')
      }
      return response
    })
    .catch(function (err) {
      console.log('Fetch err: ', err)
      return 500
    })
}

function postMailgun(data) {
  return _postData(data, '/.netlify/functions/mailgun')
}

function postDrive(data) {
  return _postData(data, '/.netlify/functions/drive')
}

export default function postData(data) {
  return [postMailgun(data), postDrive(data)]
}
