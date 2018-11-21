const formatArticleData = (rawArticleData, referenceObj) => {
  return rawArticleData.map((rawDatum) => {
    const {
      title, topic, created_by, body, created_at,
    } = rawDatum;
    const newObj = {
      title,
      topic,
      body,
      created_at: new Date(created_at),
      user_id: referenceObj[created_by],
    };
    return newObj;
  });
};

const formatCommentData = (rawCommentData, userRefObj, articleRefObj) => {
  return rawCommentData.map((rawDatum) => {
    const {
      body, belongs_to, created_by, votes, created_at,
    } = rawDatum;
    const newObj = {
      created_at: new Date(created_at),
      user_id: userRefObj[created_by],
      article_id: articleRefObj[belongs_to],
      body,
      votes,
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

module.exports = { formatArticleData, createReferenceObj, formatCommentData };
