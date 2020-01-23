document.getElementById("toggle").onclick = function() {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {message: "toggle"}, function(response) {
            //   alert(response.farewell);
          });
      });
  }