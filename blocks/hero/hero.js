export default function decorate(block) {
  // Find picture element wherever it is in the block
  const picture = block.querySelector('picture');

  // Collect all non-picture content elements from the cell
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  // Build text content wrapper
  const textWrapper = document.createElement('div');
  textWrapper.classList.add('hero-content');

  // Move non-picture elements to text wrapper
  [...cell.querySelectorAll(':scope > h1, :scope > h2, :scope > p, :scope > .button-wrapper')]
    .forEach((el) => textWrapper.append(el));

  // If no direct children matched, grab everything except picture
  if (textWrapper.children.length === 0) {
    [...cell.childNodes].forEach((node) => {
      if (node !== picture && node.nodeType === 1) {
        textWrapper.append(node);
      }
    });
  }

  // Clear block and rebuild structure
  block.textContent = '';

  // Add gradient overlay
  const overlay = document.createElement('div');
  overlay.classList.add('hero-overlay');
  block.append(overlay);

  // Add picture as background
  if (picture) block.append(picture);

  // Add text content
  block.append(textWrapper);
}
