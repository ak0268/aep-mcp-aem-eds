import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const VALUES_ICONS = ['heart', 'community', 'discovery'];

export default function decorate(block) {
  const isValues = block.classList.contains('values');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row, rowIdx) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    if (isValues) {
      // For values variant: merge all cells into a single card-body
      // First cell may contain an icon, second cell has the text content
      const cells = [...li.children];
      const body = document.createElement('div');
      body.className = 'cards-card-body';

      // Inject icon
      const iconP = document.createElement('p');
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('icon', `icon-${VALUES_ICONS[rowIdx]}`);
      iconP.append(iconSpan);
      body.append(iconP);

      // Find the cell with text content (h3 and p) and move its children
      const textCell = cells.find((c) => c.querySelector('h3'));
      if (textCell) {
        while (textCell.firstChild) body.append(textCell.firstChild);
      }

      // Clear li and add merged body
      li.replaceChildren(body);
    } else {
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = img.closest('picture');
    pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);

  // decorate icons for values variant
  if (isValues) {
    decorateIcons(block);
  }
}
