const volumeElement = <HTMLInputElement>document.getElementById('vol');

volumeElement.addEventListener('input', (e: Event) => {
  const value = parseFloat((<HTMLInputElement>e.target).value);

  chrome.storage.local.get(['volume', 'muted'], (s) => {
    if (value !== s.volume) {
      chrome.storage.local.set({volume: value});
    }
  });
});

chrome.storage.local.get(['volume', 'muted'], (s) => {
  if (volumeElement.value !== s.volume) {
    volumeElement.value = s.volume;
  }
});
