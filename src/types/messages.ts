import { Filters } from "./Filter"

export interface Message {
    type: string
    data:
        | StartRecordingMessageData
        | StopRecordingMessageData
        | UpdateEqualizerMessage
}

export interface StartRecordingMessageData {
    tab: chrome.tabs.Tab
}

export interface StopRecordingMessageData {
    tabId: number
}

export interface ContentScriptMessage {
    tabId: number
    filters: Filters
}

export interface UpdateEqualizerMessage {
    tabId: number
    filters: Filters
}
