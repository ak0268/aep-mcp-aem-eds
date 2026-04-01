import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isCardRow(row) {
  return !!row.querySelector('picture');
}

function buildHeader(headerRows) {
  const header = document.createElement('div');
  header.className = 'feature-cards-header';

  const texts = headerRows
    .map((row) => row.textContent.trim())
    .filter((t) => t);

  if (texts[0]) {
    const label = document.createElement('p');
    label.className = 'feature-cards-header-label';
    label.textContent = texts[0];
    header.append(label);
  }

  if (texts[1]) {
    const title = document.createElement('h2');
    title.className = 'feature-cards-header-title';
    title.textContent = texts[1];
    header.append(title);
  }

  if (texts[2]) {
    const subtitle = document.createElement('p');
    subtitle.className = 'feature-cards-header-subtitle';
    subtitle.textContent = texts[2];
    header.append(subtitle);
  }

  return header;
}

function buildCard(row) {
  const li = document.createElement('li');
  moveInstrumentation(row, li);

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture'));
  const contentCells = cells.filter((c) => !c.querySelector('picture'));

  if (imageCell) {
    const cardImage = document.createElement('div');
    cardImage.className = 'feature-cards-image';
    cardImage.append(...imageCell.childNodes);
    li.append(cardImage);
  }

  const cardContent = document.createElement('div');
  cardContent.className = 'feature-cards-content';

  let linkHref = '';
  let linkText = '';

  contentCells.forEach((cell) => {
    const link = cell.querySelector('a');
    if (link) {
      linkHref = link.href;
      if (link.textContent.trim()) linkText = link.textContent.trim();
      return;
    }

    const text = cell.textContent.trim();
    if (!text) return;

    // check if this is the linkText cell (no other content, short text)
    // by checking if we already have a linkHref but no linkText
    if (linkHref && !linkText) {
      linkText = text;
      return;
    }

    cardContent.append(...cell.childNodes);
  });

  if (linkHref) {
    const p = document.createElement('p');
    p.className = 'feature-cards-link';
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText || 'Learn';
    const arrow = document.createElement('span');
    arrow.className = 'feature-cards-arrow';
    arrow.textContent = '\u203A';
    a.append(arrow);
    p.append(a);
    cardContent.append(p);
  }

  // label is the first plain text paragraph
  const firstP = cardContent.querySelector('p:first-child');
  if (firstP && !firstP.querySelector('a') && !firstP.querySelector('picture')) {
    firstP.className = 'feature-cards-label';
  }

  // title is the second element (first after label)
  const label = cardContent.querySelector('.feature-cards-label');
  const nextEl = label ? label.nextElementSibling : cardContent.firstElementChild;
  if (nextEl && nextEl.tagName === 'P' && !nextEl.querySelector('a')) {
    const h3 = document.createElement('h3');
    h3.textContent = nextEl.textContent;
    nextEl.replaceWith(h3);
  }

  li.append(cardContent);
  return li;
}

export default function decorate(block) {
  const rows = [...block.children];

  // split rows: header rows (no picture) come first, then card rows (with picture)
  const headerRows = [];
  while (rows.length && !isCardRow(rows[0])) {
    headerRows.push(rows.shift());
  }
  const header = buildHeader(headerRows);

  const ul = document.createElement('ul');
  rows.forEach((row) => ul.append(buildCard(row)));

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(header);
  block.append(ul);
}
