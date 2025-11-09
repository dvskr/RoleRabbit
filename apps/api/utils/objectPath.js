const ARRAY_PATH_REGEX = /(\w+)|\[(\d+)\]/g;

function tokenize(path) {
  if (typeof path !== 'string' || !path.length) {
    return [];
  }
  const tokens = [];
  path.replace(ARRAY_PATH_REGEX, (_, prop, index) => {
    tokens.push(prop !== undefined ? prop : Number(index));
  });
  return tokens;
}

function getAtPath(target, path, defaultValue) {
  const tokens = Array.isArray(path) ? path : tokenize(path);
  if (!tokens.length) {
    return target;
  }
  let result = target;
  for (const token of tokens) {
    if (result == null) {
      return defaultValue;
    }
    result = result[token];
  }
  return result === undefined ? defaultValue : result;
}

function setAtPath(target, path, value) {
  if (target == null) {
    throw new Error('Cannot set value on undefined target');
  }
  const tokens = Array.isArray(path) ? path : tokenize(path);
  if (!tokens.length) {
    return value;
  }
  let node = target;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    if (node[token] == null) {
      node[token] = typeof nextToken === 'number' ? [] : {};
    }
    node = node[token];
  }
  node[tokens[tokens.length - 1]] = value;
  return target;
}

module.exports = {
  tokenize,
  getAtPath,
  setAtPath
};
