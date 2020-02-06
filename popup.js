import { loadExternalJSON } from "./loadJSON.js";

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
					case 'power':
						togglePowerIndicator(msg.enabled);
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
			loadExternalJSON('assets/presets.json', (presets) => {
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
				powerButton.css({fill: "#ff0000"});
			} else {
				powerButton.css({fill: "#00cc77"})
			}
		}
	
		})
	} catch (e) {
		console.error('Error initializing Chrome Equalizer extension.', e)
	}
}