exports.checkParams = (params) => {};

exports.validateQueries = (rawQueries, ...validQueries) => {
  const rawQueryArray = Object.keys(rawQueries);
  return validQueries.reduce((acc, validQuery) => {
    if (rawQueryArray.includes(validQuery)) {
      acc[validQuery] = rawQueries[validQuery];
    }
    return acc;
  }, {});
};
