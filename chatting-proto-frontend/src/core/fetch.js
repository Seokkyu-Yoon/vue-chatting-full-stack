function paramsToUrl(params = {}) {
  return Object.keys(params).map((key) => {
    const value = params[key];
    return `${key}=${value}`;
  }).join('&');
}

async function get(url, params = {}) {
  const urlParams = paramsToUrl(params);
  const urlWithParams = urlParams ? `${url}?${urlParams}` : url;
  const res = await fetch(urlWithParams);
  if (res.status !== 200) {
    throw new Error(`${res.url} failed`);
  }
  const result = await res.json();
  return result;
}

async function post(url, body = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status !== 200) {
    throw new Error(`${res.url} failed`);
  }
  const result = await res.json();
  return result;
}

async function put(url, body = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status !== 200) {
    throw new Error(`${res.url} failed`);
  }
  const result = await res.json();
  return result;
}

async function remove(url, params = {}) {
  const urlParams = paramsToUrl(params);
  const urlWithParams = urlParams ? `${url}?${urlParams}` : url;

  const res = await fetch(urlWithParams, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status !== 200) {
    throw new Error(`${res.url} failed`);
  }
  const result = await res.json();
  return result;
}

export default {
  get,
  post,
  put,
  remove,
};
