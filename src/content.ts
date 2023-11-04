// Icons from: http://free-icon-rainbow.com/volume-interface-symbol-free-icon-1/
import { addVideoEvents, extractVideosFromNode, observeContainer } from "./lib/misc";

// Use on disconnect event to detect extension update
// Keep `chrome.runtime.onConnect.addListener(port => {});` listener alive at background to prevent early disconnect
const port = chrome.runtime.connect();

const getContainer = () => document.body;

// Options for the observer (which mutations to observe)
const config: MutationObserverInit = { attributes: false, childList: true, subtree: true };
const container = getContainer();

const observerUnsubscribe = observeContainer(container, config, port);

port.onDisconnect.addListener(() => {
  // Clean up
  observerUnsubscribe();
});

// Take care of Videos already in DOM
extractVideosFromNode(container).forEach((video) => addVideoEvents(video, port));
