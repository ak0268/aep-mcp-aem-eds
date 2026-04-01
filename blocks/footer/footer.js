import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function decorateSubscribeForm(section) {
  let inputEl = null;
  let buttonEl = null;
  let inputP = null;
  let buttonP = null;

  section.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^---input-text-fiel---placeholder=(.+)$/);
    if (match) {
      inputEl = document.createElement('input');
      inputEl.type = 'email';
      inputEl.placeholder = match[1];
      inputP = p;
    }
  });

  const link = section.querySelector('a[href=":submit"]');
  if (link) {
    buttonEl = document.createElement('button');
    buttonEl.type = 'submit';
    buttonEl.textContent = link.textContent;
    buttonP = link.closest('p');
  }

  if (inputEl && buttonEl) {
    const form = document.createElement('div');
    form.classList.add('footer-subscribe-form');
    form.append(inputEl);
    form.append(buttonEl);
    inputP.replaceWith(form);
    buttonP.remove();
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = 'footer';
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const sections = [...fragment.children];

  if (sections[0]) sections[0].classList.add('footer-logo');
  if (sections[1]) {
    sections[1].classList.add('footer-nav');
    sections[1].querySelectorAll('ul > li > ul').forEach((ul) => {
      ul.classList.add('sub-items');
    });
  }
  if (sections[2]) {
    sections[2].classList.add('footer-updates');
    decorateSubscribeForm(sections[2]);
  }
  if (sections[3]) sections[3].classList.add('footer-bottom');

  sections.forEach((section) => block.append(section));
}