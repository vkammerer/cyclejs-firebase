export const objectPropsToArray = obj =>
  Object.keys(obj).map(key => ({ key, value: obj[key] }));
