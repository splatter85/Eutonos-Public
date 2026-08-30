module.exports = function reconcileLedger(entries) {
  return entries.reduce((total, entry) => total + Number(entry.amount || 0), 0);
};
