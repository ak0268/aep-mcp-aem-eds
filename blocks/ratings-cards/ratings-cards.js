import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const cards = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.classList.add('ratings-cards-grid');

  cards.forEach((row) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.classList.add('ratings-card');

    // Column 0: Image
    const imageCol = cols[0];
    const picture = imageCol?.querySelector('picture');

    // Column 1: Location name
    const location = cols[1]?.textContent?.trim() || '';

    // Column 2: Description
    const description = cols[2]?.textContent?.trim() || '';

    // Column 3: Rating
    const rating = cols[3]?.textContent?.trim() || '';

    // Build card image area
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('ratings-card-image');
    if (picture) {
      imageWrapper.append(picture);
    }

    // Rating badge overlay
    if (rating) {
      const badge = document.createElement('div');
      badge.classList.add('ratings-card-badge');
      const starSpan = document.createElement('span');
      starSpan.classList.add('icon', 'icon-star');
      badge.append(starSpan);
      const ratingText = document.createElement('span');
      ratingText.textContent = rating;
      badge.append(ratingText);
      imageWrapper.append(badge);
    }

    // Build card content area
    const content = document.createElement('div');
    content.classList.add('ratings-card-content');

    const locationEl = document.createElement('div');
    locationEl.classList.add('ratings-card-location');
    const pinSpan = document.createElement('span');
    pinSpan.classList.add('icon', 'icon-location-pin');
    locationEl.append(pinSpan);
    const locationText = document.createElement('h3');
    locationText.textContent = location;
    locationEl.append(locationText);
    content.append(locationEl);

    if (description) {
      const descEl = document.createElement('p');
      descEl.classList.add('ratings-card-description');
      descEl.textContent = description;
      content.append(descEl);
    }

    card.append(imageWrapper);
    card.append(content);
    grid.append(card);
  });

  block.append(grid);
  decorateIcons(block);
}
