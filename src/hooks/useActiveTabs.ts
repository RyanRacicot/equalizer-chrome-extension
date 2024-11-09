import { useState, useEffect } from "react"
import { TabCardProps } from "../types/TabCardProps"
import {
    Message,
    StartRecordingMessageData,
    UpdateEqualizerMessage,
} from "../types/messages"
import {
    START_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
    UPDATE_EQ_BACKEND,
    UPDATE_EQ_UI,
} from "../types/constants"

export const useActiveTabs = () => {
    const [tabs, setTabs] = useState<Map<number, TabCardProps>>(new Map())

    useEffect(() => {
        const messageListener = (
            message: Message,
            sender: chrome.runtime.MessageSender
        ) => {
            console.log(`Received tab data in React app: `, message)

            switch (message.type) {
                case START_RECORDING_MESSAGE: {
                    console.log(
                        `Received ${START_RECORDING_MESSAGE} message`,
                        message
                    )
                    setTabs((prev) => {
                        const data = message.data as StartRecordingMessageData
                        const newTabs = new Map(prev)
                        newTabs.set(data.tab.id!, {
                            id: data.tab.id!,
                            url: data.tab.url || "",
                            title: data.tab.title!,
                            isRecording: true,
                            filters: undefined,
                        })
                        return newTabs
                    })
                    break
                }
                case UPDATE_EQ_BACKEND:
                case UPDATE_EQ_UI: {
                    console.log(`Need to update EQ UI message: `, message)
                    setTabs((prev) => {
                        const data = message.data as UpdateEqualizerMessage
                        const newTabs = new Map(prev)

                        console.log(`Tab data: `, newTabs)

                        newTabs.set(data.tabId, {
                            ...prev.get(data.tabId)!, // This is wrong or atleast unsafe
                            filters: data.filters,
                        })
                        console.log(`Updated tab data:`, newTabs)
                        return newTabs
                    })
                    break
                }
                case TAB_EQ_INITIALIZED_MESSAGE: {
                    console.log(`TabEq has been initialized: ${message.data}`)
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
