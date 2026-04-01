import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const POSITION_OPTIONS = ['image-left', 'image-center'];

export default function decorate(block) {
  const rows = [...block.children];

  let topText = '';
  let labelText = '';
  let bodyContent = null;
  let imageDiv = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      if (cell.querySelector('picture')) {
        imageDiv = document.createElement('div');
        imageDiv.className = 'hero-featured-image';
        moveInstrumentation(cell, imageDiv);
        imageDiv.append(...cell.childNodes);
      } else if (cell.querySelector('h1, h2, h3, h4, h5, h6, a, ul, ol')) {
        bodyContent = document.createElement('div');
        bodyContent.className = 'hero-featured-body';
        moveInstrumentation(cell, bodyContent);
        bodyContent.append(...cell.childNodes);
      } else {
        const text = cell.textContent.trim();
        if (POSITION_OPTIONS.includes(text.toLowerCase())) {
          block.classList.add(text.toLowerCase());
        } else if (text && !topText) {
          topText = text;
        } else if (text && !labelText) {
          labelText = text;
        }
      }
    });
  });

  // optimize images
  if (imageDiv) {
    imageDiv.querySelectorAll('picture > img').forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    });
  }

  block.textContent = '';

  // build top text
  if (topText) {
    const top = document.createElement('p');
    top.className = 'hero-featured-top-text';
    top.textContent = topText;
    block.append(top);
  }

  // build content wrapper
  const content = document.createElement('div');
  content.className = 'hero-featured-content';

  const textWrapper = document.createElement('div');
  textWrapper.className = 'hero-featured-text';

  if (labelText) {
    const label = document.createElement('p');
    label.className = 'hero-featured-label';
    label.textContent = labelText;
    textWrapper.append(label);
  }

  if (bodyContent) {
    textWrapper.append(bodyContent);
  }

  content.append(textWrapper);

  if (imageDiv) {
    content.append(imageDiv);
  }

  block.append(content);
}
