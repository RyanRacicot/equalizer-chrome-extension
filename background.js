var audioContext;
var sourceAudio;
var currentPort;
var masterGain;


var filter0, filter1, filter2, filter3, filter4, filter5, filter6, filter7;

var enabled = false;

let bands = {
    "s0": {
        "type": "lowshelf",
        "frequency": 100,
        "gain": 0,
        "filter": filter0
    },
    "s1": {
        "type": "peaking",
        "frequency": 250,
        "gain": 0,
        "Q": 1.0,
        "filter": filter1
    },
    "s2": {
        "type": "peaking",
        "frequency": 500,
        "gain": 0,
        "Q": 1.0,
        "filter": filter2
    },
    "s3": {
        "type": "peaking",
        "frequency": 1000,
        "gain": 0,
        "Q": 1.0,
        "filter": filter3
    },
    "s4": {
        "type": "peaking",
        "frequency": 2000,
        "gain": 0,
        "Q": 1.0,
        "filter": filter4
    },
    "s5": {
        "type": "peaking",
        "frequency": 5000,
        "gain": 0,
        "Q": 1.0,
        "filter": filter5
    },
    "s6": {
        "type": "peaking",
        "frequency": 10000,
        "gain": 0,
        "Q": 1.0,
        "filter": filter6
    },
    "s7": {
        "type": "highshelf",
        "frequency": 12000,
        "gain": 0,
        "filter": filter7
    },
}

chrome.extension.onConnect.addListener((port) => {
    console.log('Connected EQ on: ', port);
    responseObject = {};
    currentPort = port;
    port.onMessage.addListener((msg) => {
        console.log(msg)
        switch (msg.action) {

            case 'init':
                if (!enabled) {
                    console.log('Clicked browser action first time. Initializing')
                    init();
                    enabled = true;
                } else {
                    console.log('Clicked browser action after init')
                }
                break;

            case 'power':
                Promise.all([power()])
                .then(() => {
                        port.postMessage({action: 'power', enabled: enabled});
                    })
                    .catch(e => {
                        console.error('Error in content script: ', e);
                        port.postMessage({action: msg.action, result: 'error', message: e})
                    });
                break;
    
            case 'enable':
                Promise.all([enable()])
                    .then(() => {
                        port.postMessage({enabled: enabled});
                    })
                    .catch(e => {
                        console.error('Error in content script: ', e);
                        port.postMessage({action: msg.action, result: 'error', message: e})
                    });
                break;
                    
            case 'gain-slider':
                Promise.all([changeGain(msg.slider_index, msg.value)])
                    .then(() => {
                        responseObject[msg.slider_index] = msg.slider_index;
                        responseObject[msg.value] = msg.value;
                        port.postMessage(responseObject);
                    })
                    .catch(e => {
                        console.error('Error in content script: ', e);
                        port.postMessage({action: msg.action, result: 'error', message: e})
                    })
                break;

            case 'preset':
                Promise.all([selectPreset(msg.value)])
                .then(() => {
                    port.postMessage({action: msg.action})
                })

            default:
                port.postMessage({action: "fall-through-action"});
                break;
        }
    })
});

function init() {
    chrome.tabCapture.capture({audio: true}, (stream) => {
        console.log('Captured stream: ', stream)
        audioContext = new AudioContext();
        sourceAudio = audioContext.createMediaStreamSource(stream);
        masterGain = audioContext.createGain();

        masterGain.gain.setValueAtTime(1, audioContext.currentTime)
        masterGain.gain.value = 1;

        init8BandEQFilters();

        sourceAudio
        .connect(masterGain)
        .connect(bands['s0'].filter)
        .connect(bands['s1'].filter)
        .connect(bands['s2'].filter)
        .connect(bands['s3'].filter)
        .connect(bands['s4'].filter)
        .connect(bands['s5'].filter)
        .connect(bands['s6'].filter)
        .connect(bands['s7'].filter)
        .connect(audioContext.destination)

        // disable();

        currentPort.postMessage('init')
    });
}

function init8BandEQFilters() {
    for (var bandID in bands) {
        bands[bandID].filter = audioContext.createBiquadFilter();
        bands[bandID].filter.type = bands[bandID].type;
        bands[bandID].filter.frequency.setValueAtTime(bands[bandID].frequency, audioContext.currentTime);
        bands[bandID].filter.gain.setValueAtTime(bands[bandID].gain - 8, audioContext.currentTime);
        console.log('Init: ', bands[bandID])
    }
}

function power() {
    if (enabled === false) {
        enable();
    } else {
        disable();
    }
}

function enable() {
    console.log('EQ: Power ON')
    for (var bandID in bands) {
        bands[bandID].filter.gain.setValueAtTime(bands[bandID].gain, audioContext.currentTime);
    }
    masterGain.gain = 1;
    enabled = true;
}

function disable() {
    console.log('EQ: Power OFF')
    for (var bandID in bands) {
        bands[bandID].filter.gain.setValueAtTime(0, audioContext.currentTime);
    }
    masterGain.gain.setValueAtTime(1, audioContext.currentTime);
    enabled = false;
}

function changeGain(sliderIndex, sliderValue) {
    if (sliderIndex == 'master') {
        console.log('Changing master volume to: ', sliderValue)
        masterGain.gain.setValueAtTime(sliderValue, audioContext.currentTime)
    } else {
        console.log('Setting ', sliderIndex, 'GAIN to ', sliderValue);
        bands[sliderIndex].filter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
        bands[sliderIndex].gain = sliderValue;
    }
}

function selectPreset(preset) {
    console.log('Loading preset: ', preset)
    var presets = loadPresets();
    console.log(presets)
}

function loadPresets() {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'presets.json', true); // Replace 'appDataServices' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            return xobj.responseText;
          }
    };
    xobj.send(null);  
 }