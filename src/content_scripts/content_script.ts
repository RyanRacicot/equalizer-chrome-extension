import { reject } from "q"
import { START_RECORDING_MESSAGE } from "../types/constants"
import Equalizer from "../service_worker/Equalizer"

async function captureAudio(): Promise<MediaStream> {
    return new Promise((resolve) => {
        chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
            if (stream == null) {
                window.close()
            } else {
                resolve(stream)
            }
        })
    })
}

async function startRecordingAudio(tab: chrome.tabs.Tab): Promise<void> {
    const stream = await captureAudio()

    const audioContext = new AudioContext()

    const equalizer = new Equalizer(audioContext, stream)

    await equalizer.init()
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request

    console.log(`Received tab data: `, data)

    // document.querySelector("#tab-title").textContent = data.currentTab.title

    switch (type) {
        case START_RECORDING_MESSAGE:
            startRecordingAudio(data.currentTab)
            // injectHTML(data.currentTab)
            break
        default:
            break
    }

    sendResponse({})
})
