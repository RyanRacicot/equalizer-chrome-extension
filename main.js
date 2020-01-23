var enabled = false;
var source;
var gainNode;
var filter;
var audioContext;

window.addEventListener('load', (e) => {
    console.log('EQ main.js running on', window.location.href);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    var video = $("video")[0];

    source = audioContext.createMediaElementSource(video);
    gainNode = audioContext.createGain();
    filter = audioContext.createBiquadFilter();

    source.connect(filter);
    filter.connect(audioContext.destination);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(800, audioContext.currentTime);

    // Can dynamically change!!!
    // var x = 0;
    // var intervalID = setInterval(function () {
    //     console.log('Setting filter freq to: ', x, ' it currently: ', filter.frequency);
    //     filter.frequency.setValueAtTime(x, audioContext.currentTime);
        
    
    //    if (++x === 900) {
    //        window.clearInterval(intervalID);
    //    }
    // }, 10);

    
}, false);

function toggle() {
    console.log('Clicked that toggle baby')
    if (enabled === true) {
        filter.type = "lowpass"
        enabled = false;
    } else {
        filter.type = "highpass"
        enabled = true;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        case 'toggle':
            toggle();
            break;
    
        default:
            break;
    }
    sendResponse({farewell: "goodbye"});
});



