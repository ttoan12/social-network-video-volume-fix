import { playCallback } from './video';
import Port = chrome.runtime.Port;

export function log(...args: any[]) {
  // @ts-ignore
  DEBUG
  && console.log.apply(null, args);
}

/**
 * Fix native facebook scroll when changing vol.
 * @param event
 */
export function keyupCallback(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
  }
}

export type soundEventName = 'toggle-volume' | 'volume-up' | 'volume-down' | 'volume-set';
export type StoredSoundSettings = { volume?: number; muted?: boolean };

export function handleSoundEvent(event: soundEventName, newVolume: number = 0): void {
  getVolumeSettings((r: StoredSoundSettings) => {
    let update = r;
    switch (event) {
      case 'volume-set':
        update = {...update, volume: newVolume, muted: false};
        break;
      case 'toggle-volume': // Toggle muted
        update = {...update, muted: !r.muted};
        break;
      case 'volume-down':
      case 'volume-up':
        // Calculate new volume level
        let volume = isNaN(r.volume) ? 1 : r.volume;
        volume = volume + 0.1 * ('volume-down' === event ? -1 : 1);
        volume = (volume > 1) ? 1 : volume;
        volume = (volume < 0) ? 0 : volume;
        update = {...update, volume: volume, muted: false};
    }

    // Update when changed
    if (update.volume !== r.volume || update.muted !== r.muted) {
      setVolumeSettings({...r, ...update}, () => log('Volume UPDATED to', update));
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

export function addVideoEvents(video: HTMLVideoElement, port: Port) {
  log('add events to video', video);
  video.addEventListener('play', playCallback);
  port.onDisconnect.addListener(() => video.removeEventListener('play', playCallback));

  // Parent container
  const parentContainer = video.closest('.mtm');
  if (parentContainer) {
    log('found video parent container', parentContainer, video);
    // Fix native facebook scroll when changing vol.
    parentContainer.addEventListener('keyup', keyupCallback);
    port.onDisconnect.addListener(() => parentContainer.removeEventListener('keyup', keyupCallback));
  }
}

export function observeContainer(cnt: HTMLElement, cfg: MutationObserverInit, port: Port) {
  log('STARTING NEW CONTAINER OBSERVER');
  const observer = new MutationObserver((mutationsList, obs) => {
    if (!document.contains(cnt)) {
      log('LOST CONTAINER');
      // Node was changed, find new one
      obs.disconnect();
      return;
    }

    // Callback function to execute when mutations are observed
    for (let mutation of mutationsList) {
      mutation.addedNodes.forEach((node) => {
        extractVideosFromNode(node).forEach((video) => addVideoEvents(video, port));
      });
    }
  });
  observer.observe(cnt, cfg);

  return () => {
    log('disconnecting container observer');
    observer.disconnect();
  }
}

export function getVolumeSettings(callback: (s: StoredSoundSettings) => void) {
  chrome.storage.local.get(['volume', 'muted'], (s: StoredSoundSettings) => callback.call(null, {
    volume: 1,
    muted: false,
    ...s,
  }));
}

export function setVolumeSettings(settings: StoredSoundSettings, callback?: () => void) {
  chrome.storage.local.set(settings, callback);
}
