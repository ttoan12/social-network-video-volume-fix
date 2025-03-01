import { refreshVolumeBadge } from "./lib/badge";
import { handleSoundEvent, log, soundEventName } from "./lib/misc";
import InstalledDetails = chrome.runtime.InstalledDetails;

chrome.commands.onCommand.addListener((command) => {
  if (["volume-up", "volume-down", "toggle-volume"].includes(command)) {
    handleSoundEvent(<soundEventName>command);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes["volume"] || changes["muted"]) {
    refreshVolumeBadge();
  }
});

refreshVolumeBadge();

chrome.runtime.onInstalled.addListener(installScript);

function installScript(details: InstalledDetails) {
  console.log("Installing content script in all tabs.");
  let params = {
    currentWindow: true,
  };
  chrome.tabs.query(params, function gotTabs(tabs) {
    let contentjsFile = chrome.runtime.getManifest().content_scripts[0].js[0];
    for (let index = 0; index < tabs.length; index++) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[index].id },
          files: [contentjsFile],
        },
        (result) => {
          const lastErr = chrome.runtime.lastError;
          if (lastErr) {
            // console.error('tab: ' + tabs[index].id + ' lastError: ' + JSON.stringify(lastErr));
          } else {
            log("reloaded content script for tab: " + tabs[index].id);
          }
        }
      );
    }
  });
}

// Add listener to help the content page to detect extension update
chrome.runtime.onConnect.addListener((port) => {});
