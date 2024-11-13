import {
    CURRENT_TAB_IDS_KEY,
    OPTION_TAB_ID_KEY,
    START_RECORDING_MESSAGE,
    STOP_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
    UPDATE_EQ_BACKEND,
    UPDATE_EQ_UI,
    UPDATE_TAB_METADATA,
} from "../types/constants"
import { Filters } from "../types/Filter"
import {
    ContentScriptMessage,
    StartRecordingMessageData,
    StopRecordingMessageData,
    UpdateEqualizerMessage,
} from "../types/messages"
import { getStorage, setStorage } from "./storage"
import {
    addCurrentTabId,
    clearCurrentTabIds,
    closeTab,
    openOptionsTab,
    removeCurrentTabId,
    sendMessageToTab,
} from "./tabs"

chrome.runtime.onInstalled.addListener(async () => {
    await clearCurrentTabIds()
})

chrome.action.onClicked.addListener(async (currentTab) => {
    const isActive: boolean = await tabAlreadyActive(currentTab.id!)

    if (!isActive && currentTab.audible) {
        addCurrentTabId(currentTab.id!)

        // For some reason this is very important
        await sleep(500)

        const optionTab = await openOptionsTab()

        await setStorage(OPTION_TAB_ID_KEY, optionTab.id)

        // Also very important...
        await sleep(500)

        const startRecordingMessage: StartRecordingMessageData = {
            tab: currentTab,
        }

        await sendMessageToTab(optionTab.id!, {
            type: START_RECORDING_MESSAGE,
            data: startRecordingMessage,
        })

        let optionsTabId = await getStorage(OPTION_TAB_ID_KEY)

        // Open the options tab for the extension
        chrome.tabs.update(optionsTabId, {
            active: true,
        })
    } else {
        console.log(`No audio found for tab. Skipping initializing equalizer.`)
    }
})

async function tabAlreadyActive(tabId: number): Promise<boolean> {
    const currentTabIds: number[] = await getStorage(CURRENT_TAB_IDS_KEY)

    return new Promise((resolve) => {
        if (currentTabIds) {
            resolve(currentTabIds.includes(tabId))
        } else {
            resolve(false)
        }
    })
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    let currentTabIds: number[] = await getStorage(CURRENT_TAB_IDS_KEY)
    if (currentTabIds != undefined && currentTabIds.includes(tabId)) {
        chrome.runtime.sendMessage({
            type: UPDATE_TAB_METADATA,
            data: {
                tab: tab,
            },
        })
    }
})

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    let currentTabIds: number[] = await getStorage(CURRENT_TAB_IDS_KEY)
    const optionTabId: number = await getStorage(OPTION_TAB_ID_KEY)

    // If the optionsTab is closed, remove all tabs from current
    if (tabId == optionTabId) {
        await Promise.all([clearCurrentTabIds(), closeTab(optionTabId)])
    } else if (currentTabIds.includes(tabId)) {
        // Remove tabId from currentTabIds
        let stillActiveTabs = currentTabIds.filter((id) => id != tabId)

        await setStorage(CURRENT_TAB_IDS_KEY, stillActiveTabs)

        // If the tab being closed is the last actively monitored tab, and the options tab is still open. Close the options tab.
        if (
            stillActiveTabs == undefined ||
            // (stillActiveTabs.length == 1 &&
            //     currentTabIds[0] == tabId &&
            optionTabId
        ) {
            await Promise.all([closeTab(optionTabId), clearCurrentTabIds()])
        } else {
            // There are other open tabs, so update the UI
            chrome.runtime.sendMessage({
                type: STOP_RECORDING_MESSAGE,
                data: {
                    tabId: tabId,
                },
            })
        }
    } else {
        // A tab not being recorded was closed so we don't care
    }
})

// Handle requests from React App for data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.debug(
        `Received request from React app. Forwarding to content_script`,
        message
    )

    switch (message.type) {
        case STOP_RECORDING_MESSAGE:
            let stopRecordingMessageData: StopRecordingMessageData =
                message.data as StopRecordingMessageData
            removeCurrentTabId(stopRecordingMessageData.tabId)
        default:
            console.log(
                `Received unhandled message type in backend. Forwarding along.`
            )

            break
    }

    // By default for every message forward along so React + content script can pass data
    chrome.runtime.sendMessage(message)

    sendResponse({})
})

async function sleep(ms: number = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export {}
