import Glide from '@glidejs/glide';

export function buildCarousel(parent, slides, options = {}) {
  if (slides.length > 0) {
    const slideContainer = document.createElement('div');
    slideContainer.className = 'glide';
    createSlideContainer(slideContainer, slides);
    parent.appendChild(slideContainer);
    new Glide('.glide', options).mount();
  }
}

function createSlideContainer(slideContainer, slides) {
  const slideWrapper = document.createElement('div');
  slideWrapper.className = 'glide__track';
  slideWrapper.dataset.glideEl = 'track';
  const slideList = document.createElement('ul');
  slideList.className = 'glide__slides';

  slides.forEach((slide) => slideList.appendChild(createSlideElement(slide)));

  slideWrapper.appendChild(slideList);
  slideContainer.appendChild(slideWrapper);
  if (slides.length > 0) createControls(slideWrapper);
}

function createSlideElement(slideContent) {
  const slide = document.createElement('li');
  const slideWrapper = document.createElement('div');
  slideWrapper.className = 'glide__slide__wrapper';
  if (typeof slideContent === 'string') slideWrapper.innerHTML = slideContent;
  else slideWrapper.appendChild(slideContent);
  slide.appendChild(slideWrapper);
  slide.className = 'glide__slide';
  return slide;
}

function createControls(slideWrapper) {
  slideWrapper.innerHTML += `
  <div class="glide__arrows" data-glide-el="controls">
      <button class="glide__arrow glide__arrow--left" data-glide-dir="<">
        <
      </button>
      <button class="glide__arrow glide__arrow--right" data-glide-dir=">">
        >
      </button>
    </div>
  </div>`;
}
