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
    switch (msg.action) {
      case 'init':
        $('#power-indicator').css('background-color', 'green')
        restoreOptions();
        break;
      case 'gain-slider':
        saveSliderSettings(msg.slider_index, msg.value)
        default:
      case 'power':
        $('#power-indicator').css('background-color', (msg.enabled) ? 'green': 'black')
        // console.log(msg);
        break;
    }
  })

  document.querySelectorAll('.gain-slider').forEach((slider) => {
    slider.oninput = function() {
    // slider.onchange = function() { // This is stable
      var sliderId = this.getAttribute('id')
      var sliderValue = this.value
      if (sliderId != 'master') $("label[for='" + sliderId + "']")[0].innerHTML = sliderValue + "dB"
      sendFreqSpecificGainMessage(sliderId, sliderValue)
    }
  })

  document.getElementById('presets').oninput = function() {
    port.postMessage({action: 'preset', value: this.value})
  }


  document.getElementById("power").onclick = power;
  document.getElementById("reset").onclick = reset;

  function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
    console.log('Setting', sliderNumber, ' to ', gainValue)
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
      // saveSliderSettings(sliderIDs[i], 0);
    }
    sendFreqSpecificGainMessage('master', 1);
    $('#master').val(1);
  }

  function restoreOptions() {

    chrome.storage.sync.get(null, (items) => {
      var sliderIDs = Object.keys(items);

      console.log(sliderIds)

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
