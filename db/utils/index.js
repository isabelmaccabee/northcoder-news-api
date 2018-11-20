const formatArticleData = (rawArticleData, referenceObj) => {
  return rawArticleData.map(rawDatum => {
    const { title, topic, created_by, body, created_at } = rawDatum;
    const newObj = {
      title,
      topic,
      body,
      created_at: formatDate(created_at),
      user_id: referenceObj[created_by]
    };
    return newObj;
  });
};

const formatDate = dateInSecs => {
  const articleDate = new Date(dateInSecs);
  const formattedDate = `${articleDate.getDate()}/${articleDate.getMonth()}/${articleDate.getFullYear()}`;
  //   const month =
  //     articleDate.getMonth().length === 1
  //       ? `0${articleDate.getMonth()}`
  //       : `${articleDate.getMonth()}`;
  //   const day =
  //     articleDate.getDate().length === 1
  //       ? `0${articleDate.getDate()}`
  //       : `${articleDate.getDate()}`;
  //   const year =
  //     articleDate.getYear().length === 1
  //       ? `0${articleDate.getYear()}`
  //       : `${articleDate.getYear()}`;
  //   const formattedDate = `${year}/${month}/${day}`;
  console.log(formattedDate);
  return formattedDate;
};

const createReferenceObj = (rows, columnValue, idValue) => {
  return rows.reduce((refObj, row) => {
    refObj[row[columnValue]] = row[idValue];
    // console.log(refObj);
    return refObj;
  }, {});
};

module.exports = { formatArticleData, createReferenceObj };
