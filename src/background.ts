import { refreshVolumeBadge } from './lib/badge';
import {
  handleSoundEvent,
  soundEventName,
} from './lib/misc';


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
