document.addEventListener('DOMContentLoaded', listenerEvents, false);

let sliderIDs = [
  's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'
]

var port;

async function listenerEvents() {
// Start background.js
  port = chrome.extension.connect({
    name: "Chrome Equalizer"
  });

  port.postMessage({action: 'init'})
  port.onMessage.addListener((msg) => {
    switch (msg) {
      case 'init':
        restoreOptions();
        break;
        
        default:
        // console.log(msg);
        break;
    }
  })

  $(".gain-slider").each(function (){
    $(this).on("change", function() {
        console.log($(this).attr("id"), 'is now at', $(this).val())
        sendFreqSpecificGainMessage($(this).attr("id"), parseFloat($(this).val())).then(() => {
        saveSliderSettings($(this).attr("id"), parseFloat($(this).val()));
      });
    });
  });

  
  document.getElementById("power").onclick = power;
  document.getElementById("reset").onclick = reset;

  async function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
    port.postMessage({action: 'gain-slider', slider_index: sliderNumber, value: gainValue})
  }

  async function power() {
    port.postMessage({action: 'power'})
  }

  async function reset() {
    console.log('Reseting EQ Values')
    for (var i = 0; i < sliderIDs.length; i++) {
      console.log(sliderIDs[i])
      sendFreqSpecificGainMessage(sliderIDs[i], 0);
      $('#'+sliderIDs[i]).val(0);
      saveSliderSettings(sliderIDs[i], 0);
    }
  }

  function restoreOptions() {

    chrome.storage.sync.get(null, (items) => {
      var sliderIDs = Object.keys(items);

      if (items.enabled && items.enabled == true) {
        console.log('EQ Last saved as ON')
        port.postMessage({action: 'enable'})
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

  async function saveSliderSettings(changedSliderID, value) {
    var objectToStore = {};
    objectToStore[changedSliderID] = value;
    chrome.storage.sync.set(objectToStore, () => {
      console.log('Stored', changedSliderID, ' at ', value)
    });
  }
}
