import { updateVolumeBadgeText } from './lib/badge';
import {
  getVolumeSettings,
  handleSoundEvent,
  soundEventName,
  StoredSoundSettings,
} from './lib/misc';

function refreshVolumeBadge() {
  getVolumeSettings((s: StoredSoundSettings) => updateVolumeBadgeText(s.muted, s.volume));
}

chrome.commands.onCommand.addListener((command) => {
  if (['volume-up', 'volume-down', 'toggle-volume'].includes(command)) {
    handleSoundEvent(<soundEventName>command);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes['volume'] || changes['muted']) {
    refreshVolumeBadge();
  }
});

refreshVolumeBadge();
