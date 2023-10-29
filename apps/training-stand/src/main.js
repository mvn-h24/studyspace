const METHODS = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

function queryStringify(data) {
  const result = [];
  for (const key in data) {
    result.push(`${key}=${data[key]}`);
  }
  return result.length > 0 ? `?${result.join('&')}` : '';
}

class HTTPTransport {
  get = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.GET }, options.timeout);
  post = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.POST }, options.timeout);
  put = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.PUT }, options.timeout);
  delete = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.DELETE }, options.timeout);

  request = (url, options, timeout = 5000) => {
    const { data, headers, method } = Object.assign(
      { method: 'GET', headers: {} },
      options
    );
    const createUrl = () =>
      `${url}${method === 'GET' ? queryStringify(data) : ''}`;

    const instance = new XMLHttpRequest();
    instance.timeout = timeout;
    for (const header in headers) {
      instance.setRequestHeader(header, headers[header]);
    }

    instance.open(method, createUrl());
    if (method === 'GET') {
      instance.send();
    } else {
      instance.send(data);
    }

    return new Promise((resolve, reject) => {
      instance.ontimeout = reject.bind(null, instance);
      instance.onload = resolve.bind(null, instance);
    });
  };
}

const http = new HTTPTransport();

function fetchWithRetry(url, options) {
  let tryCount = options.retries ?? 1;
  const retryer = () =>
    http.request(url, options).catch((e) => {
      tryCount--;
      if (tryCount > 0) {
        return retryer();
      } else {
        return e;
      }
    });
  return retryer();
}

(async () => {
  console.log(
    await fetchWithRetry('http://localhost:3000/api', { retries: 5 })
  );
})();
