import { useState, useEffect } from "react"
import { TabCardProps } from "../types/TabCardProps"
import {
    Message,
    StartRecordingMessageData,
    StopRecordingMessageData,
} from "../types/messages"
import {
    START_RECORDING_MESSAGE,
    STOP_RECORDING_MESSAGE,
} from "../types/constants"

export const useActiveTabs = () => {
    const [tabs, setTabs] = useState<Map<number, TabCardProps>>(new Map())

    useEffect(() => {
        const messageListener = (
            message: Message,
            sender: chrome.runtime.MessageSender
        ) => {
            console.log(`Received tab data: ${message.data}`)

            switch (message.type) {
                case START_RECORDING_MESSAGE: {
                    console.log(`Received ${START_RECORDING_MESSAGE} message`)
                    setTabs((prev) => {
                        const data = message.data as StartRecordingMessageData
                        const newTabs = new Map(prev)
                        newTabs.set(data.tab.id!, {
                            id: data.tab.id!,
                            url: data.tab.url || "",
                            title: data.tab.title!,
                            isRecording: true,
                        })
                        return newTabs
                    })
                    break
                }
                // case STOP_RECORDING_MESSAGE: {
                //     console.log(`Received ${STOP_RECORDING_MESSAGE} message`)
                //     const data = message.data as StopRecordingMessageData
                //     setTabs(prev => {
                //         const newTabs = new Map(prev)
                //         const currentTab = newTabs.get(data.tabId)
                //         if (currentTab) {
                //             newTabs.set(data.tabId, {
                //                 ...currentTab,
                //                 isRecording: false
                //             })
                //         }
                //         return newTabs
                //     })
                //     break
                // }
            }
        }

        chrome.runtime.onMessage.addListener(messageListener)

        // Clean up
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener)
        }
    }, [])

    return Array.from(tabs.values())
}
