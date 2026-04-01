export default function decorate(block) {
  const rows = [...block.children];
  let imageDiv = null;
  let contentDiv = null;

  rows.forEach((row) => {
    const cell = row.children[0];
    if (!cell) return;
    if (cell.querySelector('picture')) {
      imageDiv = document.createElement('div');
      imageDiv.className = 'hero-image';
      imageDiv.append(...cell.childNodes);
    } else {
      contentDiv = document.createElement('div');
      contentDiv.className = 'hero-content';
      contentDiv.append(...cell.childNodes);
    }
  });

  if (contentDiv) {
    const buttons = contentDiv.querySelectorAll('p.button-container');
    if (buttons.length > 0) {
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.className = 'hero-buttons';
      buttons.forEach((btn) => buttonsWrapper.append(btn));
      contentDiv.append(buttonsWrapper);
    }
  }

  block.textContent = '';
  if (contentDiv) block.append(contentDiv);
  if (imageDiv) block.append(imageDiv);
}
