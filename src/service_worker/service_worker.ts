import {
    CURRENT_TAB_IDS_KEY,
    OPTION_TAB_ID_KEY,
    START_RECORDING_MESSAGE,
} from "../types/constants"
import { getStorage, setStorage } from "./storage"
import {
    addCurrentTabId,
    clearCurrentTabIds,
    closeTab,
    openOptionsTab,
    sendMessageToTab,
} from "./tabs"

chrome.action.onClicked.addListener(async (currentTab) => {
    console.log(`Clicked on the action button in tab: ${currentTab}`)

    const isActive: boolean = await tabAlreadyActive(currentTab.id!)

    if (isActive) {
        // TODO - Disable and remove that tab
    }

    if (currentTab.audible) {
        addCurrentTabId(currentTab.id!)

        // For some reason this is very important
        await sleep(500)

        const optionTab = await openOptionsTab()

        await setStorage(OPTION_TAB_ID_KEY, optionTab.id)

        // Also very important...
        await sleep(500)

        await sendMessageToTab(optionTab.id!, {
            type: START_RECORDING_MESSAGE,
            data: {
                tab: currentTab,
            },
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

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const currentTabIds: number[] = await getStorage(CURRENT_TAB_IDS_KEY)
    const optionTabId: number = await getStorage(OPTION_TAB_ID_KEY)

    // If the tab being closed is the last actively monitored tab, and the options tab is still open. Close the options tab.
    if (currentTabIds.length == 1 && currentTabIds[0] == tabId && optionTabId) {
        await Promise.all([closeTab(optionTabId), clearCurrentTabIds()])
    }
})

async function sleep(ms: number = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export {}