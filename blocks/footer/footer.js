import { decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SOCIAL_ICONS = ['facebook', 'instagram', 'twitter', 'email'];

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // always load footer from /footer
  const footerPath = '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // ensure brand column has airplane icon
  const brandCol = footer.querySelector('.columns > div > div:first-child');
  if (brandCol) {
    const brandP = brandCol.querySelector('p:first-of-type');
    if (brandP && !brandP.querySelector('.icon-airplane')) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('icon', 'icon-airplane');
      brandP.prepend(iconSpan);
    }
  }

  // ensure last column has social media icons
  const lastCol = footer.querySelector('.columns > div > div:last-child');
  if (lastCol && !lastCol.querySelector('.icon')) {
    let iconsP = lastCol.querySelector('p');
    if (!iconsP) {
      iconsP = document.createElement('p');
      lastCol.append(iconsP);
    }
    if (iconsP.querySelectorAll('.icon').length === 0) {
      SOCIAL_ICONS.forEach((name) => {
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('icon', `icon-${name}`);
        iconsP.append(iconSpan);
      });
    }
  }

  decorateIcons(footer);
  block.append(footer);
}
