function availableTotal(records) {
  return records.reduce((total, record) => total + Number(record.amount || 0), 0);
}

module.exports = { availableTotal };
