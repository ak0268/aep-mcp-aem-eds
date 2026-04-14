import { decorateIcons } from '../../scripts/aem.js';

const FEATURES_ICONS = ['globe', 'shield', 'clock'];

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // inject icons for features variant if not already present
  if (block.classList.contains('features')) {
    [...block.children].forEach((row) => {
      [...row.children].forEach((col, i) => {
        if (!col.querySelector('.icon') && FEATURES_ICONS[i]) {
          const iconP = document.createElement('p');
          const iconSpan = document.createElement('span');
          iconSpan.classList.add('icon', `icon-${FEATURES_ICONS[i]}`);
          iconP.append(iconSpan);
          col.prepend(iconP);
        }
      });
    });
    decorateIcons(block);
  }
}
