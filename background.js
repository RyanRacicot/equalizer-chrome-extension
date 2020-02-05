import Equalizer from './Equalizer.js';

var Equalizers = {};

chrome.extension.onConnect.addListener((port) => {

    port.onMessage.addListener((msg) => {

        let currentTabEQ = Equalizers[msg.tabID];

        if (!currentTabEQ && msg.action != 'init') {
            console.error('No EQ initialized for tab: ', msg.tabID);
            return;
        }

        switch (msg.action) {

            case 'init':
                if (currentTabEQ) {
                    // Already initialized Equalizer for tab
                    port.postMessage({action: msg.action, enabled: currentTabEQ.enabled})
                } else {
                    createEqualizer(msg.tabID)
                    .then(() => {
                        port.postMessage({action: msg.action, enabled: Equalizers[msg.tabID].enabled})
                    })
                }
            break;

            case 'power':
                currentTabEQ.power().then(() => {
                    port.postMessage({action: 'power', enabled: currentTabEQ.enabled, tab: msg.tabID});
                })
            break;
    
            case 'enable':
                currentTabEQ.enable().then(() => {
                    port.postMessage({enabled: currentTabEQ.enabled, tab: msg.tabID})
                })
            break;
                    
            case 'gain-slider':
                currentTabEQ.changeGain(msg.slider_index, msg.value).then(() => {
                    port.postMessage({action: msg.action, slider_index: msg.slider_index, value: msg.value});
                })
            break;

            case 'preset':
                currentTabEQ.selectPreset(msg.preset).then(() => {
                    port.postMessage({action: msg.action, tab: msg.tabID, preset: msg.preset})
                })
            break;

            default:
                port.postMessage({action: "fall-through-action"});
            break;
        }
    })
});

async function createEqualizer(currentTabID) {
    Equalizers[currentTabID] = (new Equalizer(currentTabID));
}