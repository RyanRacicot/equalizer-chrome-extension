export interface Message {
    type: string
    data: StartRecordingMessageData | StopRecordingMessageData
}

export interface StartRecordingMessageData {
    tab: chrome.tabs.Tab
}

export interface StopRecordingMessageData {
    tabId: number
}
