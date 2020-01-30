var enabled;
var source;
var audioContext;

var lowFilter, midFilter, highFilter;

var filter0, filter1, filter2, filter3, filter4, filter5, filter6, filter7;

let bands = {
    "s0": {
        "type": "lowpass",
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

window.addEventListener('load', (e) => {
    console.log('EQ main.js running on', window.location.href);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    var video = $("video")[0];
    if (video != undefined) {
        source = audioContext.createMediaElementSource(video);

            init8BandEQFilters();
        
            // Setup Effects Pipeline
            bands['s0'].filter
            .connect(bands['s1'].filter)
            .connect(bands['s2'].filter)
            .connect(bands['s3'].filter)
            .connect(bands['s4'].filter)
            .connect(bands['s5'].filter)
            .connect(bands['s6'].filter)
            .connect(bands['s7'].filter)
            .connect(audioContext.destination);
    
            // But don't connect source audio to them yet.
            source.connect(audioContext.destination);
    
            enabled = false;
    
    }

}, false);


function init8BandEQFilters() {
    for (var bandID in bands) {
        bands[bandID].filter = audioContext.createBiquadFilter();
        bands[bandID].filter.type = bands[bandID].type;
        bands[bandID].filter.frequency.setValueAtTime(bands[bandID].frequency, audioContext.currentTime);
        bands[bandID].filter.gain.setValueAtTime(bands[bandID].gain, audioContext.currentTime);
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
    if (source && bands['s0'].filter) {
        console.log('EQ: Power ON')
        source.connect(bands['s0'].filter);
    }
    enabled = true;
}

function disable() {
    if (enabled && source && bands['s0'].filter && audioContext) {
        console.log('EQ: Power OFF')
        try {
            source.disconnect(bands['s0'].filter);
        } catch (e) {
            console.log('Tried to disconnect first filter from source but taht shit wasnt conencted')
        }
        source.connect(audioContext.destination);
    }
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

    bands[sliderIndex].filter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
    bands[sliderIndex].gain = sliderValue;
}

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     var responseObject = {};
//     switch (request.message) {
//         case 'power':
//             Promise.all([power()])
//             .then(() => {
//                     sendResponse({enabled: enabled});
//                 })
//                 .catch(e => {
//                     console.error('Error in content script: ', e);
//                     sendResponse({action: request.action, result: 'error', message: e})
//                 });
//             break;

//         case 'enable':
//             Promise.all([enable()])
//                 .then(() => {
//                     sendResponse({enabled: enabled});
//                 })
//                 .catch(e => {
//                     console.error('Error in content script: ', e);
//                     sendResponse({action: request.action, result: 'error', message: e})
//                 });
//             break;

//         case 'reset':
//             Promise.all([reset()])
//                 .then(() => {
//                     sendResponse({reset: true});
//                 })
//                 .catch(e => {
//                     console.error('Error in content script: ', e);
//                     sendResponse({action: request.action, result: 'error', message: e})
//                 });
//             break;
                
//         case 'gain-slider':
//             Promise.all([changeGain(request.slider_index, request.value)])
//                 .then(() => {
//                     responseObject[request.slider_index] = request.value;
//                     sendResponse(responseObject);
//                 })
//                 .catch(e => {
//                     console.error('Error in content script: ', e);
//                     sendResponse({action: request.action, result: 'error', message: e})
//                 })
//             break;
//         default:
//             sendResponse({action: "fall-through-action"});
//             break;
//     }
// });



