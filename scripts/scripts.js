import {
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  loadCSS,
  loadFooter,
  loadHeader,
  loadSection,
  loadSections,
  waitForFirstImage,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

function initWebSDK(path, config) {
  // Preparing the alloy queue
  if (!window.alloy) {
    // eslint-disable-next-line no-underscore-dangle
    (window.__alloyNS ||= []).push('alloy');
    window.alloy = (...args) =>
      new Promise((resolve, reject) => {
        window.setTimeout(() => {
          window.alloy.q.push([resolve, reject, args]);
        });
      });
    window.alloy.q = [];
  }
  // Loading and configuring the websdk
  return new Promise((resolve) => {
    import(path).then(() => window.alloy('configure', config)).then(resolve);
  });
}

function onDecoratedTarget(propositions) {
  // Apply target to all already decorated blocks
  document.querySelectorAll('[data-block-status="loaded"]').forEach((block) => {
    applyTarget(block, propositions);
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (
        m.target.dataset.blockStatus === 'loaded' &&
        m.attributeName === 'data-block-status' &&
        m.target.dataset.blockName == 'header'
      ) {
        applyTarget(m.target, propositions);
      }
    });
  });
  // Watch blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status'],
  });
  // Watch anything else added to the body
  //observer.observe(document.querySelector('body'), { childList: true });
  observer.observe(document.querySelector('header'), {
    childList: true,
    attributes: true,
    subtree: true,
  });
}

async function applyTarget(block, propositions) {
  if (!block.dataset.blockName || !propositions) return;
  const blockName = block.dataset.blockName;

  try {
    const mod = await import(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`);
    if (mod.target) {
      const renderedPropositions = await mod.target(block, propositions);
      sendPropositionDisplayEvent(renderedPropositions);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load module for ${blockName}`, error);
  }
}

function sendPropositionDisplayEvent(propositions) {
  if (!propositions || !Array.isArray(propositions) || propositions.length === 0) return;

  const propositionEventData = [];
  propositions.forEach((p) => {
    propositionEventData.push({
      id: p.id,
      scope: p.scope,
      scopeDetails: p.scopeDetails,
    });
  });

  const eventData = {
    xdm: {
      eventType: 'decisioning.propositionDisplay',
      _experience: {
        decisioning: { propositionEventData },
      },
      propositionEventType: {
        display: 1,
      },
    },
  };

  window.alloy('sendEvent', enrichEventDataWithImpersonation(eventData));
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (m) =>
          m.target.tagName === 'BODY' ||
          m.target.dataset.sectionStatus === 'loaded' ||
          m.target.dataset.blockStatus === 'loaded'
      )
    ) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), { childList: true });
}

function toCssSelector(selector) {
  return selector.replace(
    /(\.\S+)?:eq\((\d+)\)/g,
    (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`
  );
}

async function getElementForProposition(proposition) {
  const selector = proposition.data.prehidingSelector || toCssSelector(proposition.data.selector);
  return document.querySelector(selector);
}

/**
 * Gets the impersonation identityMap from localStorage if it exists
 * @returns {Object|null} The identityMap object or null if no impersonation is set
 */
function getImpersonationIdentityMap() {
  const STORAGE_KEY = 'eds-impersonation-email';
  const EMAIL_NAMESPACE = 'Email';
  
  try {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail && storedEmail.trim() !== '') {
      return {
        [EMAIL_NAMESPACE]: [
          {
            id: storedEmail.trim(),
            primary: true,
            authenticatedState: "authenticated",
          },
        ],
      };
    }
  } catch (e) {
    // Silently fail - impersonation is optional
  }
  return null;
}

/**
 * Enriches event data with impersonation identityMap if it exists
 * @param {Object} eventData The original event data for sendEvent
 * @returns {Object} The enriched event data with identityMap if impersonation exists
 */
function enrichEventDataWithImpersonation(eventData) {
  const identityMap = getImpersonationIdentityMap();
  if (!identityMap) {
    return eventData;
  }

  // Clone the event data to avoid mutating the original
  const enriched = { ...eventData };
  
  // Ensure xdm exists
  if (!enriched.xdm) {
    enriched.xdm = {};
  } else {
    enriched.xdm = { ...enriched.xdm };
  }

  // Merge identityMap into xdm
  if (enriched.xdm.identityMap) {
    // If identityMap already exists, merge the impersonation identity
    enriched.xdm.identityMap = {
      ...enriched.xdm.identityMap,
      ...identityMap,
    };
  } else {
    enriched.xdm.identityMap = identityMap;
  }

  return enriched;
}

async function getAndApplyRenderDecisions() {
  // Get the decisions, but don't render them automatically
  // so we can hook up into the AEM EDS page load sequence
  const eventData = { renderDecisions: true, decisionScopes: ['offers'] };
  const response = await window.alloy('sendEvent', enrichEventDataWithImpersonation(eventData));
  const { propositions } = response;
  onDecoratedTarget(propositions);

  /*
  onDecoratedElement(async () => {
    await window.alloy('applyPropositions', { propositions });
    // keep track of propositions that were applied
    propositions.forEach((p) => {
      p.items = p.items.filter(
        (i) => i.schema !== 'https://ns.adobe.com/personalization/dom-action' || !getElementForProposition(i)
      );
    });
  });
  */

  // Reporting is deferred to avoid long tasks
  window.setTimeout(() => {
    // Report shown decisions
    const reportEventData = {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: {
          decisioning: { propositions },
        },
      },
    };
    window.alloy('sendEvent', enrichEventDataWithImpersonation(reportEventData));
  });
}

let alloyLoadedPromise = initWebSDK('./alloy.js', {
  datastreamId: 'ee51f8b8-378f-4dab-a1a9-ce5477fe7d53',
  orgId: '36DE898555D732137F000101@AdobeOrg',
});

//if (getMetadata('target')) {
alloyLoadedPromise.then(() => getAndApplyRenderDecisions());
//}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    // wait for alloy to finish loading
    await alloyLoadedPromise;
    // break up possible long tasks before showing the LCP block to reduce TBT
    await new Promise((res) => {
      window.setTimeout(async () => {
        // For newer AEM boilerplate, use this
        await loadSection(main.querySelector('.section'), waitForFirstImage);
        // For older AEM boilerplate versions, use this instead
        // await waitForLCP(LCP_BLOCKS);
        res();
      }, 0);
    });
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
