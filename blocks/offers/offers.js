import { buildCarousel } from '../../libs/index.js';

export default function decorate(block) {
  /* change to ul, li */
  const header = document.createElement('h2');
  const headerElement = block.firstElementChild;
  header.textContent = headerElement.textContent;
  block.prepend(header);
  headerElement.remove();

  const offerContainer = document.createElement('div');
  offerContainer.className = 'offer-carousel';
  block.appendChild(offerContainer);
}

export function target(block, propositions) {
  const offerContainer = block.querySelector('.offer-carousel');
  // Implementation for targeting offers based on propositions goes here
  if (!propositions || !Array.isArray(propositions)) return;

  const renderedPropositions = [];
  const offers = [];

  propositions.forEach((p) => {
    if (Array.isArray(p.items)) {
      let rendered = false;
      p.items.forEach((item) => {
        if (item.data && item.data.format == 'application/json' && item.data.content) {
          if (Array.isArray(item.data.content)) {
            item.data.content.forEach((offer) => {
              const offerElement = createOfferElement(offer);
              if (offerElement) {
                offers.push(offerElement);
                rendered = true;
              }
            });
          } else {
            const offerElement = createOfferElement(item.data.content);
            if (offerElement) {
              offers.push(offerElement);
              rendered = true;
            }
          }
        }
      });
      if (rendered) renderedPropositions.push(p);
    }
  });
  if (offers.length > 0)
    buildCarousel(offerContainer, offers, {
      type: 'slider',
      startAt: 0,
      perView: 3,
      classes: {
        disabledArrow: 'glide__arrow--disabled',
      },
      breakpoints: {
        1024: {
          perView: 2,
        },
        640: {
          perView: 1,
        },
      },
    });
  return renderedPropositions;
}

function createOfferElement(offerItem) {
  if (!offerItem.title) return false;

  const offer = document.createElement('div');
  offer.className = 'offer';
  if (offerItem.image) {
    const image = document.createElement('img');
    image.src = offerItem.image;
    image.alt = offerItem.title;
    image.width = 250;
    offer.appendChild(image);
  }
  const offerDetails = document.createElement('div');
  offerDetails.className = 'offer-details';

  const offerTitle = document.createElement('h3');
  offerTitle.textContent = offerItem.title;

  const offerDescription = document.createElement('p');
  offerDescription.textContent = offerItem.description;

  const offerPrice = document.createElement('div');
  offerPrice.className = 'offer-price';
  offerPrice.textContent = 'Starting from:';
  const offerPriceValue = document.createElement('span');
  offerPriceValue.textContent = '$' + offerItem.price;
  offerPrice.appendChild(offerPriceValue);

  const offerCTA = document.createElement('a');
  offerCTA.href = offerItem.url;
  offerCTA.textContent = 'Show Details';
  offerCTA.className = 'offer-cta';

  offerDetails.appendChild(offerTitle);
  offerDetails.appendChild(offerDescription);
  offerDetails.appendChild(offerPrice);
  offerDetails.appendChild(offerCTA);
  offer.appendChild(offerDetails);
  return offer;
}
