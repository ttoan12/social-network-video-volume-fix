import { playCallback } from './video';

export function log(...args: any[]) {
  // @ts-ignore
  DEBUG
  && console.log.apply(null, args);
}

export function keyupCallback(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp'].find((k) => k === event.key)) {
    // Fix native facebook scroll when changing vol.
    event.preventDefault();
  }
}

export function pageKeyupCallback(event: KeyboardEvent) {
  if (!(event.ctrlKey && event.shiftKey && ['ArrowDown', 'ArrowUp', 'Backspace'].find(k => k === event.key))) {
    return;
  }

  chrome.storage.sync.get(['volume', 'muted'], (r) => {
    let update = {};
    switch (event.key) {
      case 'Backspace': // Toggle muted
        update = {...update, muted: !r.muted};
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        // Calculate new volume level
        let volume = r.volume + 0.1 * ('ArrowDown' === event.key ? -1 : 1);
        volume = (volume > 1) ? 1 : volume;
        volume = (volume < 0) ? 0 : volume;
        if (volume !== r.volume || r.muted) { // Update only if changed or was muted
          update = {...update, volume: volume, muted: false};
        }
    }
    if (Object.keys(update).length) {
      chrome.storage.sync.set({...r, ...update}, () => log('Volume UPDATED to', update));
    }
  });
}

export function extractVideosFromNode(node: Node): Array<HTMLVideoElement> {
  const videoElements: Array<HTMLVideoElement> = [];
  // Only Element node allowed
  if (1 !== node.nodeType) {
    return videoElements;
  }

  let videoCollection = (<Element>node).getElementsByTagName('video');

  for (let i = 0; i < videoCollection.length; i++) {
    videoElements.push(videoCollection.item(i));
  }
  return videoElements;
}

export function appendVideoFunctionality(video: HTMLVideoElement) {
  video.addEventListener('play', playCallback);

  // Parent container
  const parentContainer = video.closest('.mtm');
  if (parentContainer) {
    log('found video parent container', parentContainer, video);
    parentContainer.addEventListener('keyup', keyupCallback);
  }
}

export function observeContainer(cnt: HTMLElement, cfg: MutationObserverInit) {
  log('STARTING NEW CONTAINER OBSERVER');
  return new MutationObserver((mutationsList, obs) => {
    if (!document.contains(cnt)) {
      log('LOST CONTAINER');
      // Node was changed, find new one
      obs.disconnect();
      return;
    }

    // Callback function to execute when mutations are observed
    for (let mutation of mutationsList) {
      mutation.addedNodes.forEach((node) => {
        extractVideosFromNode(node).forEach(appendVideoFunctionality);
      });
    }
  }).observe(cnt, cfg);
}
