import {
  getVolumeSettings,
  setVolumeSettings,
  StoredSoundSettings,
} from './lib/misc';
import Command = chrome.commands.Command;

const volumeElement = <HTMLInputElement>document.getElementById('vol');
const helpButtonElement = <HTMLButtonElement>document.getElementById('help-button');
const helpArea = document.getElementById('help-area');
const shortcutTemplate = <HTMLTemplateElement>document.getElementById('shortcut-template');
const shortcutsList = document.getElementById('shortcuts-list');

/**
 * Generate html shortcut item from template
 *
 * @param command
 * @param template
 */
function drawButtonsFactory(command: Command, template: HTMLTemplateElement) {

  const keys = command.shortcut
    .split('+')
    .map(key => `<kbd>${key.trim()}</kbd>`)
    .join(' + ');
  const description = command.description;

  const clone = document.importNode(template.content, true);

  clone.querySelector('.shortcut-keys').innerHTML = keys;
  clone.querySelector('.shortcut-description').textContent = description;

  return clone;
}

// Create list of available shortcuts
chrome.commands.getAll((info) => {
  shortcutsList.append(
    ...info
      .filter((shortcut) => ['volume-up', 'volume-down', 'toggle-volume'].includes(shortcut.name))
      .map((c) => drawButtonsFactory(c, shortcutTemplate)),
  );
});

// Toggle help button
helpButtonElement
  .addEventListener('click', (e) => {
    helpArea.classList.remove('hidden');
    helpButtonElement.classList.add('hidden');
  });

document.querySelectorAll('[link]')
  .forEach((element) => {
    element.addEventListener('click', (e) => {
      chrome.tabs.create({
        url: chrome.i18n.getMessage(element.getAttribute('link')),
      });
    });
  });

document.querySelectorAll('[translate]')
  .forEach((element) => {
    element.textContent = chrome.i18n.getMessage(element.textContent);
  });

volumeElement.addEventListener('input', (e: Event) => {
  const value = parseFloat((<HTMLInputElement>e.target).value);

  getVolumeSettings((s: StoredSoundSettings) => {
    if (value !== s.volume) {
      setVolumeSettings({volume: value});
    }
  });
});

getVolumeSettings((s: StoredSoundSettings) => {
  if (parseInt(volumeElement.value) !== s.volume) {
    volumeElement.value = isNaN(s.volume) ? '1' : s.volume.toString();
  }
});
