module.exports = function summarizeOperations(records) {
  return { count: records.length, ready: records.every(record => record.ready === true) };
};
