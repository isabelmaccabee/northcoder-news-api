const formatArticleData = (rawArticleData, referenceObj) => {
  return rawArticleData.map(rawDatum => {
    const { title, topic, created_by, body, created_at } = rawDatum;
    const newObj = {
      title,
      topic,
      body,
      created_at: new Date(created_at),
      user_id: referenceObj[created_by]
    };
    return newObj;
  });
};

const createReferenceObj = (rows, columnValue, idValue) => {
  return rows.reduce((refObj, row) => {
    refObj[row[columnValue]] = row[idValue];
    return refObj;
  }, {});
};

module.exports = { formatArticleData, createReferenceObj };
