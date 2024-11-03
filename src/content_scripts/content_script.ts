import {
    START_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
} from "../types/constants"
import Equalizer from "../service_worker/Equalizer"
import { sendMessageToRuntime } from "../service_worker/tabs"
import { StartRecordingMessageData } from "../types/messages"

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
    console.log(`Attempting to record tab: `, tab)
    const stream = await captureAudio()

    const audioContext = new AudioContext()

    const equalizer = new Equalizer(audioContext, stream)

    await equalizer.init().then(() => {
        console.log(
            `Equalizer initialized, attempting to send filter data back to application`
        )
        sendMessageToRuntime({
            type: TAB_EQ_INITIALIZED_MESSAGE,
            data: {
                tabId: tab.id!,
                filters: equalizer.filters,
            },
        })
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request

    console.log(`Received runtime message in content_script: `, request)

    // document.querySelector("#tab-title").textContent = data.currentTab.title

    switch (type) {
        case START_RECORDING_MESSAGE:
            const parsed = data as StartRecordingMessageData
            startRecordingAudio(parsed.tab)
            // injectHTML(data.currentTab)
            break
        default:
            break
    }

    sendResponse({})
})
