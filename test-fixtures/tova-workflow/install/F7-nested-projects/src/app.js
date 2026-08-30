module.exports = function portfolioStatus(items) {
  return items.map(item => ({ id: item.id, status: item.status || 'unknown' }));
};
