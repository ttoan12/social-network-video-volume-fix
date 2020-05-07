import {
  deEase,
  ease,
  getVolumeSettings,
  keyupCallback,
  log,
  storeVolumeSettings,
} from './misc';

/**
 * Callback function for on stored volume value change event
 * update video settings with new values
 *
 * @param video
 */
function onStorageUpdateVideo(video: HTMLVideoElement) {
  return (changes: { [key: string]: { newValue?: any; oldValue?: any; } }) => {
    if (changes['volume']) {
      video.volume = ease(changes['volume'].newValue);
    }

    if (changes['muted']) {
      video.muted = changes['muted'].newValue;
    }
  };
}

/**
 * Set video volume level from storage volume settings
 *
 * @param video
 */
function setVideoVolumeFromStorage(video: HTMLVideoElement) {
  getVolumeSettings((stored) => {
    const easedVolume = ease(stored.volume);
    if (easedVolume !== video.volume) {
      video.volume = easedVolume;
      video.muted = stored.muted;
    }
  });
}

/**
 * Callback function on video pause.
 * Remove all event listeners bind to the video
 *
 * @param pauseEvent
 */
function onVideoPauseRemoveListeners(pauseEvent: Event) {
  log('PAUSE');
  chrome.storage.onChanged.removeListener(onStorageUpdateVideo(<HTMLVideoElement>pauseEvent.target));
  pauseEvent.target.removeEventListener('pause', onVideoPauseRemoveListeners);
  pauseEvent.target.removeEventListener('volumechange', onVideoVolumeChangeUpdateStorage);
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

  event.target.addEventListener('pause', onVideoPauseRemoveListeners);
  event.target.addEventListener('volumechange', onVideoVolumeChangeUpdateStorage);

  // Update video volume on storage change
  chrome.storage.onChanged.addListener(onStorageUpdateVideo(video));

  setVideoVolumeFromStorage(video);
}

/**
 * Callback function to update storage with video volume level
 *
 * @param event
 */
function onVideoVolumeChangeUpdateStorage(event: Event) {
  log('Volume CHANGE STARTED');
  const video: HTMLVideoElement = <HTMLVideoElement>event.target;

  // Update only when changed
  getVolumeSettings((r) => {

    const absoluteVolume = deEase(video.volume); // use absolute volume

    if (absoluteVolume === video.volume && r.muted === video.muted) {
      log('Not Changed', r.volume, absoluteVolume, video.volume, r.muted, video.muted);
      return;
    }
    storeVolumeSettings({
      ...r,
      volume: absoluteVolume,
      muted: video.muted,
    }, () => log('Volume CHANGED to', absoluteVolume, video.volume, video.muted));
  });
}
