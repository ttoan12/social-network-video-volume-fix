import {
  ease,
  getVolumeSettings,
  StoredSoundSettings,
} from './misc';

export function formatVolumeForBadge(value: number) {
  return Math.round(value * 100) + '%';
}

export function setBadgeText(text: string) {
  chrome.browserAction.setBadgeText({text});
}

export function updateVolumeBadgeText(muted: boolean, volume: number) {
  if (muted) {
    setBadgeText('x');
    return;
  }

  setBadgeText(formatVolumeForBadge(volume));
}

export function refreshVolumeBadge() {
  getVolumeSettings((s: StoredSoundSettings) => updateVolumeBadgeText(s.muted, ease(s.volume)));
}
