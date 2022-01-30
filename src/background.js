import Equalizer from './Equalizer.js';

var Equalizers = {};

chrome.extension.onConnect.addListener((port) => {

    port.onMessage.addListener((msg) => {

        let currentTabEQ = Equalizers[msg.tabID];

        switch (msg.action) {

            case 'init':
                if (currentTabEQ) {
                    port.postMessage({action: msg.action, enabled: currentTabEQ.enabled, filters: currentTabEQ.filters})
                } else {
                    createEqualizer(msg.tabID)
                    .then((createdEq) => {
                        port.postMessage({action: msg.action, enabled: createdEq.enabled, filters: createdEq.filters})
                    })
                }
            break;

            case 'power':
                currentTabEQ.power().then(() => {
                    port.postMessage({action: 'power', enabled: currentTabEQ.enabled, tab: msg.tabID, filters: currentTabEQ.filters});
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

            case 'save-default':
                currentTabEQ.setCurrentFilterValuesAsDefault()
                break

            default:
                port.postMessage({action: "fall-through-action"});
            break;
        }
    })
});

async function createEqualizer(currentTabID) {
    return new Promise((resolve, reject) => {
        try {
            new Equalizer(currentTabID).then(createdEq => {
                Equalizers[currentTabID] = createdEq
                console.log('Finished creating EQ for tab here it is: ', createdEq)
                resolve(createdEq)
            })
        } catch (e) {
            reject()
        }
    })
}