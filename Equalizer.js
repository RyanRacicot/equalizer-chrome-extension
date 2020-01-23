
// const captureAudio = (timeLimit, muteTab, format, quality, limitRemoved) => {
//     chrome.tabCapture.capture({audio: true}, (stream) => {
//         let startTabId;
//         let timeout;
//         let completeTabId;
        
//         chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//             startTabId = tabs[0].id
//         })

//         const audioStream = stream;
//         const audioContext = new AudioContext();
//         const source = audioContext.createMediaStreamSource(stream);

//         let mediaRecorder = new mediaRecorder(source);
//         mediaRecorder.setEncoding(format);

//     })
// };
