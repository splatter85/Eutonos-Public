function exportInventory(records) {
  return [...records].sort((left, right) => left.id.localeCompare(right.id));
}

module.exports = { exportInventory };
