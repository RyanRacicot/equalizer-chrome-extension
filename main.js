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

    source = audioContext.createMediaElementSource(video);

    init8BandEQFilters();
    // init3BandFilters();

    source.connect(bands['s0'].filter)
    .connect(bands['s1'].filter)
    .connect(bands['s2'].filter).connect(bands['s3'].filter).connect(bands['s4'].filter).connect(bands['s5'].filter).connect(bands['s6'].filter).connect(bands['s7'].filter).connect(audioContext.destination);
    // source.connect(lowFilter).connect(midFilter).connect(highFilter).connect(audioContext.destination);
}, false);


function init8BandEQFilters() {
    // var lowshelfFilter = audioContext.createBiquadFilter();
    // lowshelfFilter.type = "lowshelf";
    // lowshelfFilter.frequency.setValueAtTime(bands['s0'].frequency, audioContext.currentTime);
    // lowshelfFilter.gain.setValueAtTime(bands['s0'].gain, audioContext.currentTime);
    // bands['s0'].filter = lowshelfFilter;
    filter0 = audioContext.createBiquadFilter();
    filter0.type = "lowshelf";
    filter0.frequency.setValueAtTime(bands['s0'].frequency, audioContext.currentTime);
    filter0.gain.setValueAtTime(bands['s0'].gain, audioContext.currentTime);
    bands['s0'].filter = filter0;

    filter1 = audioContext.createBiquadFilter();
    filter1.type = "peaking";
    filter1.frequency.setValueAtTime(bands['s1'].frequency, audioContext.currentTime);
    filter1.gain.setValueAtTime(bands['s1'].gain, audioContext.currentTime);
    bands['s1'].filter = filter1;

    filter2 = audioContext.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.setValueAtTime(bands['s2'].frequency, audioContext.currentTime);
    filter2.gain.setValueAtTime(bands['s2'].gain, audioContext.currentTime);
    bands['s2'].filter = filter2;

    filter3 = audioContext.createBiquadFilter();
    filter3.type = "peaking";
    filter3.frequency.setValueAtTime(bands['s3'].frequency, audioContext.currentTime);
    filter3.gain.setValueAtTime(bands['s3'].gain, audioContext.currentTime);
    bands['s3'].filter = filter3;

    filter4 = audioContext.createBiquadFilter();
    filter4.type = "peaking";
    filter4.frequency.setValueAtTime(bands['s4'].frequency, audioContext.currentTime);
    filter4.gain.setValueAtTime(bands['s4'].gain, audioContext.currentTime);
    bands['s4'].filter = filter4;

    filter5 = audioContext.createBiquadFilter();
    filter5.type = "peaking";
    filter5.frequency.setValueAtTime(bands['s5'].frequency, audioContext.currentTime);
    filter5.gain.setValueAtTime(bands['s5'].gain, audioContext.currentTime);
    bands['s5'].filter = filter5;

    filter6 = audioContext.createBiquadFilter();
    filter6.type = "peaking";
    filter6.frequency.setValueAtTime(bands['s6'].frequency, audioContext.currentTime);
    filter6.gain.setValueAtTime(bands['s6'].gain, audioContext.currentTime);
    bands['s6'].filter = filter6;

    filter7 = audioContext.createBiquadFilter();
    filter7.type = "highshelf";
    filter7.frequency.setValueAtTime(bands['s7'].frequency, audioContext.currentTime);
    filter7.gain.setValueAtTime(bands['s7'].gain, audioContext.currentTime);
    bands['s7'].filter = filter7;
}
function init3BandFilters() {
    lowFilter = audioContext.createBiquadFilter();
    lowFilter.type = "lowshelf";
    lowFilter.frequency.setValueAtTime(bands["s0"].max, audioContext.currentTime);
    lowFilter.gain.setValueAtTime(0, audioContext.currentTime);

    midFilter = audioContext.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.setValueAtTime(4000, audioContext.currentTime);
    midFilter.Q.setValueAtTime(1, audioContext.currentTime);
    midFilter.gain.setValueAtTime(0, audioContext.currentTime);

    highFilter = audioContext.createBiquadFilter();
    highFilter.type = "highshelf";
    highFilter.frequency.setValueAtTime(bands["s2"].min, audioContext.currentTime);
    highFilter.gain.setValueAtTime(0, audioContext.currentTime);
}

function power() {
    if (enabled === true) {
        console.log('Turning Equalizer OFF')
        source.disconnect(bands['s0'].filter);
        source.connect(audioContext.destination);
        // source.disconnect(lowFilter);
        // source.connect(audioContext.destination);
        enabled = false;
    } else {
        console.log('Turning Equalizer ON')
        // source.connect(lowFilter);
        source.connect(bands['s0'].filter);
        enabled = true;
    }
}

function changeGain(sliderIndex, sliderValue) {
    console.log('Setting ', sliderIndex, 'GAIN to ', sliderValue);

    switch (sliderIndex) {
        case 's0':
            filter0.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's1':
            filter1.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's2':
            filter2.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's3':
            filter3.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's4':
            filter4.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's5':
            filter5.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's6':
            filter6.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;
        case 's7':
            filter7.gain.setValueAtTime(sliderValue, audioContext.currentTime);
            break;  
        default:
            break;
    }
    // bands[sliderIndex]['gain'] = sliderValue;
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



