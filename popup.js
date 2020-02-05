import { loadExternalJSON } from "./loadJSON.js";

// document.addEventListener('DOMContentLoaded', listenerEvents, false);
document.addEventListener('DOMContentLoaded', main, false);

let sliderIDs = [
  's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'
]

var port;
var tabID;

async function main() {
	port = chrome.extension.connect({
		name: "Chrome Equalizer"
	})
	try {
		chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
			tabID = tabs[0].id
			port.postMessage({action: 'init', tabID: tabID})
	
			port.onMessage.addListener((msg) => {
				switch (msg.action) {
					case 'init':
						togglePowerIndicator(msg.enabled);
						break;
		
					case 'gain-slider':
						console.log(msg)
						break;
		
					case 'power':
						togglePowerIndicator(msg.enabled);
						break;
		
					case 'preset':
						break;
		
					default:
				}
			})

		document.querySelectorAll('.gain-slider').forEach((slider) => {
			slider.oninput = function() {
				var sliderId = this.getAttribute('id')
				var sliderValue = this.value
				if (sliderId != 'master') $("label[for='" + sliderId + "']")[0].innerHTML = sliderValue + "dB"
				sendFreqSpecificGainMessage(sliderId, sliderValue)
			}
		})
	
		document.getElementById('presets').oninput = function() {
			port.postMessage({action: 'preset', preset: this.value, tabID: tabID})
			loadExternalJSON('presets.json', (presets) => {
				for (let [sliderName, value] of Object.entries(presets[this.value])) {
					setSliderValue(sliderName, value);
				}
			}, (e) => {
				console.error(e)
			})
		}
	
		document.getElementById("power").onclick = power;
		document.getElementById("reset").onclick = reset;
	
		function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
			port.postMessage({action: 'gain-slider', slider_index: sliderNumber, value: gainValue, tabID: tabID})
		}
	
		async function power() {
			port.postMessage({action: 'power', tabID: tabID})
		}
	
		async function reset() {
			for (var i = 0; i < sliderIDs.length; i++) {
				sendFreqSpecificGainMessage(sliderIDs[i], 0);
				$('#'+sliderIDs[i]).val(0);
				$("label[for='" + sliderIDs[i] + "']").text('0dB')
			}
		}
		
		function setSliderValue(sliderID, value) {
			$('#'+sliderID).val(value)
			$("label[for='" + sliderID + "']").text(value + 'dB')
		}
	
		function togglePowerIndicator(enabled) {
			var powerButton = $("#power-icon")
	
			if (!enabled) {
				powerButton.css({ fill: "#ff0000" });
			} else {
				powerButton.css({fill: "#00cc77"})
			}
		}
	
		})
	} catch (e) {
		console.error('Error initializing Chrome Equalizer extension.', e)
	}
}

// Old, Single Instance of EQ
async function listenerEvents() {
	// Start background.js
	port = chrome.extension.connect({
		name: "Chrome Equalizer"
	});

	port.postMessage({action: 'init'})
	// restoreOptions();

	port.onMessage.addListener((msg) => {
		switch (msg.action) {
			case 'init':
				togglePowerIndicator(msg.enabled);
				restoreOptions();
				saveSliderSettings('enabled', msg.enabled);
				break;

			case 'gain-slider':
				saveSliderSettings(msg.slider_index, msg.value)
				break;

			case 'power':
				console.log('Recieved power msg', msg)
				saveSliderSettings('enabled', msg.enabled)
				togglePowerIndicator(msg.enabled);
				break;

			case 'preset':

				break;

			default:
		}
	})

	document.querySelectorAll('.gain-slider').forEach((slider) => {
		slider.oninput = function() {
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
		// console.log('Setting', sliderNumber, ' to ', gainValue)
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
			$("label[for='" + sliderIDs[i] + "']").text('0dB')
			saveSliderSettings(sliderIDs[i], 0);
		}
	}

	function restoreOptions() {
		chrome.storage.sync.get(null, (items) => {
			var sliderIDs = Object.keys(items);

			// console.log(sliderIds)

			// if (items.enabled && items.enabled == true) {
			//   console.log('EQ Last saved as ON')
			//   port.postMessage({action: 'enable'})
			// } else {
			//   console.log('EQ Last saved as OFF')
			// }
			// delete items.enabled;

			// Restore Slider Values
			for (var key in items) {
				sendFreqSpecificGainMessage(key, items[key]);
				$('#'+key).val(items[key]);
				if (key != 'master') $("label[for='" + key + "']")[0].innerHTML = items[key] + "dB"

			}
		});
	}

	async function saveSliderSettings(changedSliderID, value) {
		var objectToStore = {};
		objectToStore[changedSliderID] = value;
		chrome.storage.sync.set(objectToStore, () => {
			// console.log('Stored', changedSliderID, ' at ', value)
		});
	}

	function togglePowerIndicator(enabled) {
		console.log('Toggling power indicator, ', (enabled) ? 'ON' : 'OFF')

		var powerButton = $("#power-icon")

		if (!enabled) {
			powerButton.css({ fill: "#ff0000" });
		} else {
			powerButton.css({fill: "#00cc77"})
		}

		console.log(powerButton)
	}
}
