import {
    START_RECORDING_MESSAGE,
    STOP_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
    UPDATE_EQ_BACKEND,
    UPDATE_TAB_METADATA,
} from "../types/constants"
import Equalizer from "../service_worker/Equalizer"
import { sendMessageToRuntime } from "../service_worker/tabs"
import {
    StartRecordingMessageData,
    StopRecordingMessageData,
    UpdateEqualizerMessage,
    UpdateTabMetadataMessageData,
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

async function stopRecordingAudio(tabId: number): Promise<void> {
    await tabEqualizers.get(tabId)?.disable()
}

async function startRecordingAudio(tab: chrome.tabs.Tab): Promise<void> {
    console.log(`Attempting to capture audio for tab: `, tab)
    const stream: MediaStream = await captureAudio()

    const audioContext = new AudioContext()

    const equalizer = new Equalizer(audioContext, stream)

    await equalizer.init().then(() => {
        tabEqualizers.set(tab.id!, equalizer)

        sendMessageToRuntime({
            type: TAB_EQ_INITIALIZED_MESSAGE,
            data: {
                tabId: tab.id!,
                filters: equalizer.filters,
            },
        })
    })
}

async function handleTabUpdated(tab: chrome.tabs.Tab): Promise<void> {
    if (tab.id && tabEqualizers.has(tab.id)) {
        const eq = tabEqualizers.get(tab.id)!
        if (!tab.audible || tab.mutedInfo?.muted) {
            eq.mute()
        } else {
            eq.unmute()
        }
    }
}

async function updateEqualizer(tabId: number, filters: Filters) {
    let equalizer = tabEqualizers.get(tabId)

    if (equalizer != undefined) {
        // Update the audio
        equalizer.update(filters)
        // Update the UI
    } else {
        // console.error(`No equalizer found for tabId: ${tabId}`)
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request

    // console.log(`Received runtime message in content_script: `, request)

    switch (type) {
        case START_RECORDING_MESSAGE:
            let startRecordingMessageData = data as StartRecordingMessageData
            startRecordingAudio(startRecordingMessageData.tab)
            break
        case UPDATE_EQ_BACKEND:
            let updateEqualizerMessage = data as UpdateEqualizerMessage

            updateEqualizer(
                updateEqualizerMessage.tabId,
                updateEqualizerMessage.filters
            )
            break
        case STOP_RECORDING_MESSAGE:
            let stopRecordingMessageData = data as StopRecordingMessageData
            stopRecordingAudio(stopRecordingMessageData.tabId)
            break
        case UPDATE_TAB_METADATA:
            let updateTabMetaData = data as UpdateTabMetadataMessageData
            handleTabUpdated(updateTabMetaData.tab)
        default:
            break
    }

    sendResponse({})
})
