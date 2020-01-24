var enabled;
var source;
var audioContext;

var lowFilter, midFilter, highFilter;

let bands = {
    "s0": {
        "min": 20,
        "max": 300,
        "gain": 0
    },
    "s1": {
        "min": 300,
        "max": 4000,
        "gain": 0
    },
    "s2": {
        "min": 4000,
        "max": 20000,
        "gain": 0
    }
}

window.addEventListener('load', (e) => {
    console.log('EQ main.js running on', window.location.href);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    var video = $("video")[0];

    source = audioContext.createMediaElementSource(video);

    initFilters();

    source.connect(lowFilter).connect(midFilter).connect(highFilter).connect(audioContext.destination);
}, false);

function initFilters() {
    lowFilter = audioContext.createBiquadFilter();
    lowFilter.type = "lowshelf";
    lowFilter.frequency.setValueAtTime(bands["s0"].max, audioContext.currentTime);
    lowFilter.gain.setValueAtTime(0, audioContext.currentTime);

    midFilter = audioContext.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
    midFilter.Q.setValueAtTime(100, audioContext.currentTime);
    midFilter.gain.setValueAtTime(0, audioContext.currentTime);

    highFilter = audioContext.createBiquadFilter();
    highFilter.type = "highshelf";
    highFilter.frequency.setValueAtTime(bands["s0"].min, audioContext.currentTime);
    highFilter.gain.setValueAtTime(0, audioContext.currentTime);
}

function power() {
    if (enabled === true) {
        console.log('Turning Equalizer OFF')
        source.disconnect(lowFilter);
        source.connect(audioContext.destination);
        enabled = false;
    } else {
        console.log('Turning Equalizer ON')
        source.connect(lowFilter);
        enabled = true;
    }
}

function changeGain(sliderIndex, sliderValue) {
    console.log('Setting ', sliderIndex, 'GAIN to ', sliderValue);
    switch (sliderIndex) {
        case 's0':
            lowFilter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's1':
            midFilter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's2':
            highFilter.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
    
        default:
            break;
    }
    bands[sliderIndex]['gain'] = sliderValue;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        case 'power':
            power();
            break;
        case 'gain-slider':
            sendResponse({value: request.value})
            changeGain(request.slider_index, request.value);
            break;
        default:
            break;
    }
    sendResponse({farewell: "goodbye"});
});



