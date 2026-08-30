function renderEventCard(event) {
  return `<article><time>${event.date}</time><h2>${event.title}</h2></article>`;
}

module.exports = { renderEventCard };
