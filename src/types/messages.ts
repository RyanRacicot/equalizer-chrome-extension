export interface Message {
    type: string
    data: StartRecordingMessageData | StopRecordingMessageData
}

interface StartRecordingMessageData {
    tab: chrome.tabs.Tab
}

interface StopRecordingMessageData {
    tabId: number
}
