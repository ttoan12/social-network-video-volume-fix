// Icons from: http://free-icon-rainbow.com/volume-interface-symbol-free-icon-1/

(function () {
  const debug = false;

  function log() {
    debug && console.log.apply(null, arguments);
  }

  function onPlay(v) {
    log('PLAY');
    chrome.storage.sync.get('volume', (r) => {
      if ('undefined' !== typeof r.volume && r.volume !== v.target.volume) {
        v.target.volume = r.volume;
      }
    });

  }

  function onVolumeChange(v) {
    log('CHANGE STARTED');
    // Update only when changed
    chrome.storage.sync.get('volume', (r) => {
      if (r.volume === v.target.volume) {
        return;
      }
      chrome.storage.sync.set({volume: v.target.volume}, function () {
        log('CHANGED');
      });
    });
  }

  function appendToNodeVideos(item) {
    try {
      let videos = item.getElementsByTagName('video');
      for (let video of videos) {
        log('Added', video);
        video.addEventListener("play", onPlay);
        video.addEventListener("volumechange", onVolumeChange);
      }
    } catch (e) {
    }
  }

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      for (let item of mutation.addedNodes) {
        appendToNodeVideos(item);
      }
    }
  };

  // Options for the observer (which mutations to observe)
  const config = {attributes: false, childList: true, subtree: true};

  function init() {
    const interval = setInterval(() => {
      log('Interval');

      // Select the node that will be observed for mutations
      // const container = document.getElementById('contentArea');
      const container = document.body;
      if (!container) {
        return;
      }
      clearInterval(interval);

      // We are here, so everything was found

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback);

      // Setup Observers for container, will init everything once again when lost
      const documentObserver = new MutationObserver((mutationsList, obs) => {
        if (!document.contains(container)) {
          // Node was changed, find new one
          observer.disconnect();
          obs.disconnect();
          init();
        }
      });

      // Start observing the document for container changes
      documentObserver.observe(document, config);
      // Start observing the target node for configured mutations
      observer.observe(container, config);

      // Take care of all videos already exists on the page
      appendToNodeVideos(container);

    }, 500);
  }

  init();
})();
