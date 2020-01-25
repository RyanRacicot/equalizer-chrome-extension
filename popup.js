document.addEventListener('DOMContentLoaded', listenerEvents, false);

function listenerEvents() {
  console.log('Pop-Up Window Content Loaded. Binding onChange functions');
  restoreOptions();

  $(".gain-slider").each(function (){
    $(this).on("change", function() {
      console.log($(this).attr("id"), 'is now at', $(this).val())
      sendFreqSpecificGainMessage($(this).attr("id"), parseFloat($(this).val())).then(() => {
        saveSliderSettings($(this).attr("id"), parseFloat($(this).val()));
      });
    });
  });
  
  document.getElementById("power").onclick = power;

  async function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
    // console.log(sliderNumber, gainValue)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: "gain-slider", slider_index: sliderNumber ,value: gainValue}, function(response) {
        // alert(response);
      });
    });
  }

  function power() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: "power"}, function(response) {
        chrome.storage.sync.set({enabled: response.enabled}, () => {
          console.log('Stored on status to ', response.enabled)
        });
      });
    });
  }

  function restoreOptions() {
    chrome.storage.sync.get(null, (items) => {
      var sliderIDs = Object.keys(items);

      if (items.enabled && items.enabled == true) {
        console.log('EQ Last saved as ON')
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {message: "enable"}, function(response) {
            
          });
        });
      } else {
        console.log('EQ Last saved as OFF')
      }
      delete items.enabled;

      // Restore Slider Values
      for (var key in items) {
        sendFreqSpecificGainMessage(key, items[key]);
        $('#'+key).val(items[key]);
      }
    });
  }

  function saveSliderSettings(changedSliderID, value) {
    var objectToStore = {};
    objectToStore[changedSliderID] = value;
    chrome.storage.sync.set(objectToStore, () => {
      console.log('Stored', changedSliderID, ' at ', value)
    });
  }
}
