// Icons from: http://free-icon-rainbow.com/volume-interface-symbol-free-icon-1/
import StorageChange = chrome.storage.StorageChange;
// @ts-ignore
const debug = DEBUG;

function log(...args: any[]) {
  debug && console.log.apply(null, args);
}

// Start listen to global volume change combination
const storageListenerCallback = (video: HTMLVideoElement) => (changes: { [key: string]: StorageChange }) => {
  if (changes['volume']) {
    video.volume = changes['volume'].newValue;
  }

  if (changes['muted']) {
    video.muted = changes['muted'].newValue;
  }
};

const pauseListenerCallback = (pauseEvent: Event) => {
  log('PAUSE');
  chrome.storage.onChanged.removeListener(storageListenerCallback(<HTMLVideoElement>pauseEvent.target));
  pauseEvent.target.removeEventListener('pause', pauseListenerCallback);
  pauseEvent.target.removeEventListener('volumechange', onVolumeChange);
};

function onPlay(event: Event) {
  log('PLAY');
  const video: HTMLVideoElement = <HTMLVideoElement>event.target;

  event.target.addEventListener('pause', pauseListenerCallback);
  chrome.storage.onChanged.addListener(storageListenerCallback(video));
  event.target.addEventListener('volumechange', onVolumeChange);

  chrome.storage.sync.get(['volume', 'muted'], (r) => {
    if ('undefined' !== typeof r.volume && r.volume !== video.volume) {
      video.volume = r.volume;
      video.muted = r.muted;
    }
  });
}

function onVolumeChange(event: Event) {
  log('Volume CHANGE STARTED');
  const video: HTMLVideoElement = <HTMLVideoElement>event.target;

  // Update only when changed
  chrome.storage.sync.get(['volume', 'muted'], (r) => {
    if (r.volume === video.volume && r.muted === video.muted) {
      return;
    }
    chrome.storage.sync.set({...r, volume: video.volume, muted: video.muted}, () => {
      log('Volume CHANGED to', video.volume, video.muted);
    });
  });

}

function appendToNodeVideos(item: Node) {
  try {
    // Only Element node allowed
    if (1 !== item.nodeType) {
      return;
    }

    let videos = (<Element>item).getElementsByTagName('video');
    for (let i = 0; i < videos.length; i++) {
      const video = videos.item(i);
      log('Added', video);
      video.addEventListener('play', onPlay);

      // Parent container
      const parentContainer = video.closest('.mtm');
      if (parentContainer) {
        log('found video parent container', parentContainer, video);
        parentContainer.addEventListener('keyup', function (event: KeyboardEvent) {
          if (['ArrowDown', 'ArrowUp'].find((k) => k === event.key)) {
            // Fix native facebook scroll when changing vol.
            event.preventDefault();
          }
        });

      }
    }
  } catch (e) {
    log(e);
  }
}

const getContainer = () => {
  return document.body;
};

const observeContainer = (cnt: HTMLElement, cfg: MutationObserverInit) => {
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
      mutation.addedNodes.forEach(appendToNodeVideos);
    }
  }).observe(cnt, cfg);
};


// Options for the observer (which mutations to observe)
const config: MutationObserverInit = {attributes: false, childList: true, subtree: true};
const container = getContainer();
observeContainer(container, config);

// Take care of Videos already in DOM
appendToNodeVideos(container);

container.addEventListener('keyup', function (event: KeyboardEvent) {
  if (!(event.ctrlKey && event.shiftKey && ['ArrowDown', 'ArrowDown', 'Backspace'].find(k => event.key))) {
    return;
  }

  chrome.storage.sync.get('volume', (r) => {
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
});
