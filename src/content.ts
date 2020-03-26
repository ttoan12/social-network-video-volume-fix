// Icons from: http://free-icon-rainbow.com/volume-interface-symbol-free-icon-1/
import {
  appendVideoFunctionality,
  extractVideosFromNode,
  observeContainer,
  pageKeyupCallback,
} from './lib/misc';

const getContainer = () => document.body;

// Options for the observer (which mutations to observe)
const config: MutationObserverInit = {attributes: false, childList: true, subtree: true};
const container = getContainer();

observeContainer(container, config);

// Take care of Videos already in DOM
extractVideosFromNode(container).forEach(appendVideoFunctionality);

// Add shortcuts to change volume level and mute
document.body.addEventListener('keyup', pageKeyupCallback);
