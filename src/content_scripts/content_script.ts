import {
    START_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
    UPDATE_EQ_BACKEND,
} from "../types/constants"
import Equalizer from "../service_worker/Equalizer"
import { sendMessageToRuntime } from "../service_worker/tabs"
import {
    StartRecordingMessageData,
    UpdateEqualizerMessage,
} from "../types/messages"
import { Filters } from "../types/Filter"

const tabEqualizers = new Map<number, Equalizer>()

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
            `Equalizer initialized for tab: ${tab.id}, attempting to send filter data back to application`
        )

        tabEqualizers.set(tab.id!, equalizer)

        console.log(`tabEqualizers: `, tabEqualizers)

        sendMessageToRuntime({
            type: TAB_EQ_INITIALIZED_MESSAGE,
            data: {
                tabId: tab.id!,
                filters: equalizer.filters,
            },
        })
    })
}

async function updateEqualizer(tabId: number, filters: Filters) {
    console.log(`Current equalizers: `, tabEqualizers)

    console.log(`UPDATE EQUALIZER: `, tabId, filters)

    let equalizer = tabEqualizers.get(tabId)

    console.log(`equalizer for tab: `, equalizer)

    if (equalizer != undefined) {
        // Update the audio
        equalizer.update(filters)
        // Update the UI
    } else {
        console.error(`No equalizer found for tabId: ${tabId}`)
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request

    console.log(`Received runtime message in content_script: `, request)

    // document.querySelector("#tab-title").textContent = data.currentTab.title

    switch (type) {
        case START_RECORDING_MESSAGE:
            let startRecordingMessageData = data as StartRecordingMessageData
            startRecordingAudio(startRecordingMessageData.tab)
            break
        case UPDATE_EQ_BACKEND:
            let updateEqualizerMessage = data as UpdateEqualizerMessage

            console.log(
                `Parsed updateEqualizerMessage: `,
                type,
                updateEqualizerMessage
            )
            updateEqualizer(
                updateEqualizerMessage.tabId,
                updateEqualizerMessage.filters
            )
            break
        default:
            break
    }

    sendResponse({})
})
