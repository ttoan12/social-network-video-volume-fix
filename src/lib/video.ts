import {
  keyupCallback,
  log,
} from './misc';

/**
 * Start listen to global volume change combination
 *
 * @param video
 */
const getStorageListenerCallback = (video: HTMLVideoElement) => (changes: { [key: string]: { newValue?: any; oldValue?: any; } }) => {
  if (changes['volume']) {
    video.volume = changes['volume'].newValue;
  }

  if (changes['muted']) {
    video.muted = changes['muted'].newValue;
  }
};

/**
 *
 * @param pauseEvent
 */
function pauseListenerCallback(pauseEvent: Event) {
  log('PAUSE');
  chrome.storage.onChanged.removeListener(getStorageListenerCallback(<HTMLVideoElement>pauseEvent.target));
  pauseEvent.target.removeEventListener('pause', pauseListenerCallback);
  pauseEvent.target.removeEventListener('volumechange', volumeChangeCallback);
}

/**
 *
 * @param event
 */
export function playCallback(event: Event) {
  log('PLAY');
  const video: HTMLVideoElement = <HTMLVideoElement>event.target;

  // Parent container
  const parentContainer = video.closest('.mtm');
  if (parentContainer) {
    log('found video parent container', parentContainer, video);
    parentContainer.addEventListener('keyup', keyupCallback);
  }

  event.target.addEventListener('pause', pauseListenerCallback);
  chrome.storage.onChanged.addListener(getStorageListenerCallback(video));
  event.target.addEventListener('volumechange', volumeChangeCallback);

  chrome.storage.local.get(['volume', 'muted'], (r) => {
    if ('undefined' !== typeof r.volume && r.volume !== video.volume) {
      video.volume = r.volume;
      video.muted = r.muted;
    }
  });
}

function volumeChangeCallback(event: Event) {
  log('Volume CHANGE STARTED');
  const video: HTMLVideoElement = <HTMLVideoElement>event.target;

  // Update only when changed
  chrome.storage.local.get(['volume', 'muted'], (r) => {
    if (r.volume === video.volume && r.muted === video.muted) {
      return;
    }
    chrome.storage.local.set({...r, volume: video.volume, muted: video.muted}, () => {
      log('Volume CHANGED to', video.volume, video.muted);
    });
  });
}
