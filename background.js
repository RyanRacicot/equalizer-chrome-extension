var audioContext;
var sourceAudio;
var currentPort;

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
                        port.postMessage({enabled: enabled});
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
    
            case 'reset':
                Promise.all([reset()])
                    .then(() => {
                        port.postMessage({reset: true});
                    })
                    .catch(e => {
                        console.error('Error in content script: ', e);
                        port.postMessage({action: msg.action, result: 'error', message: e})
                    });
                break;
                    
            case 'gain-slider':
                Promise.all([changeGain(msg.slider_index, msg.value)])
                    .then(() => {
                        responseObject[msg.slider_index] = msg.value;
                        port.postMessage(responseObject);
                    })
                    .catch(e => {
                        console.error('Error in content script: ', e);
                        port.postMessage({action: msg.action, result: 'error', message: e})
                    })
                break;

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

        init8BandEQFilters();

        sourceAudio
        .connect(bands['s0'].filter)
        .connect(bands['s1'].filter)
        .connect(bands['s2'].filter)
        .connect(bands['s3'].filter)
        .connect(bands['s4'].filter)
        .connect(bands['s5'].filter)
        .connect(bands['s6'].filter)
        .connect(bands['s7'].filter)
        .connect(audioContext.destination)

        currentPort.postMessage('init')
    });
}

function init8BandEQFilters() {
    for (var bandID in bands) {
        bands[bandID].filter = audioContext.createBiquadFilter();
        bands[bandID].filter.type = bands[bandID].type;
        bands[bandID].filter.frequency.setValueAtTime(bands[bandID].frequency, audioContext.currentTime);
        bands[bandID].filter.gain.setValueAtTime(bands[bandID].gain, audioContext.currentTime);
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
    sourceAudio.connect(bands['s0'].filter);
    enabled = true;
}

function disable() {
    console.log('EQ: Power OFF')
    sourceAudio.disconnect(bands['s0'].filter);
    sourceAudio.connect(audioContext.destination);
    enabled = false;
}

function reset() {
    console.log('RESET')
    for (filter in bands) {
        if (bands[filter].filter) {
            bands[filter].filter.gain.setValueAtTime(0, audioContext.currentTime);
            bands[filter].gain = 0;
        }
    }
}

function changeGain(sliderIndex, sliderValue) {
    console.log('Setting ', sliderIndex, 'GAIN to ', sliderValue);
    console.log(bands[sliderIndex])
    bands[sliderIndex].filter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
    bands[sliderIndex].gain = sliderValue;
    console.log('sound dest', audioContext.destination);
}