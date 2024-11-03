import { CURRENT_TAB_IDS_KEY, OPTION_TAB_ID_KEY } from "../types/constants"
import { Message } from "../types/messages"
import { getStorage, setStorage } from "./storage"

export async function sendMessageToTab(
    tabId: number,
    data: Message
): Promise<void> {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, data, (res) => {
            resolve(res)
        })
    })
}

export async function sendMessageToRuntime(message: Message): Promise<void> {
    return chrome.runtime.sendMessage(message.data)
}

export async function openOptionsTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
        getStorage(OPTION_TAB_ID_KEY).then((optionTabId: number) => {
            console.log(`Attempting to open optionTabId: ${optionTabId}`)

            getAlreadyOpenOptionTab(optionTabId)
                .then((openOptionsTab) => {
                    if (openOptionsTab) {
                        console.log(`Options Tab is already open!`)
                        resolve(openOptionsTab)
                    } else {
                        resolve(createOptionsTab())
                    }
                })
                .catch((e) => {
                    console.log(
                        `Existing optionTab did not exist, attempting to open new one now.`
                    )

                    resolve(createOptionsTab())
                })
        })
    })
}

export async function closeTab(tabId: number): Promise<void> {
    return new Promise((resolve) =>
        chrome.tabs.remove(tabId).then(resolve).catch(resolve)
    )
}

export async function addCurrentTabId(tabId: number) {
    console.log(`Attempting to add tabId: ${tabId} to local storage.`)

    const currentTabIds: number[] = await getStorage(CURRENT_TAB_IDS_KEY)

    console.log(`Already active tabIds: ${currentTabIds}`)

    if (currentTabIds) {
        currentTabIds.push(tabId)
        await setStorage(CURRENT_TAB_IDS_KEY, currentTabIds)
    } else {
        await setStorage(CURRENT_TAB_IDS_KEY, [tabId])
    }
}

export async function clearCurrentTabIds() {
    await setStorage(CURRENT_TAB_IDS_KEY, [])
}

async function createOptionsTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
        chrome.tabs.create(
            {
                pinned: true,
                active: false,
                url: `chrome-extension://${chrome.runtime.id}/index.html`,
            },
            (newOptionsTab) => {
                resolve(newOptionsTab)
            }
        )
    })
}

async function getAlreadyOpenOptionTab(
    tabId: number
): Promise<chrome.tabs.Tab | undefined> {
    const optionsTab = await chrome.tabs.get(tabId)
    try {
        handleOptionsTabNotExistsError()
        return optionsTab
    } catch (e) {
        console.error(`Failed to get already open optionsTab: ${e}`)
        return undefined
    }
}

function handleOptionsTabNotExistsError() {
    const error = chrome.runtime.lastError
    if (error) {
        throw new Error(error.message)
    }
}
