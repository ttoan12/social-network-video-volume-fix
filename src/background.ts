import { updateVolumeBadgeText } from './lib/badge';

function refreshVolumeBadge() {
  chrome.storage.local.get(['volume', 'muted'], (s) => updateVolumeBadgeText(s.muted, s.volume));
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes['volume'] || changes['muted']) {
    refreshVolumeBadge();
  }
});

refreshVolumeBadge();
