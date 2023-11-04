import { deEase, ease, getVolumeSettings, StoredSoundSettings, storeVolumeSettings } from "./lib/misc";

const volumeInput = <HTMLInputElement>document.getElementById("vol");

document.querySelectorAll("[translate]").forEach((element) => {
  element.textContent = chrome.i18n.getMessage(element.textContent);
});

volumeInput.addEventListener("input", (e: Event) => {
  const value = deEase((<HTMLInputElement>e.target).value);

  getVolumeSettings((s: StoredSoundSettings) => {
    if (value !== s.volume) {
      storeVolumeSettings({ volume: value });
    }
  });
});

// Set initial input value from storage
getVolumeSettings((s: StoredSoundSettings) => {
  if (deEase(volumeInput.value) !== s.volume) {
    volumeInput.value = ease(s.volume).toString();
  }
});
