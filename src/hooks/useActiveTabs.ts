import { useState, useEffect } from "react"
import { TabCardProps } from "../types/TabCardProps"
import {
    Message,
    StartRecordingMessageData,
    StopRecordingMessageData,
    UpdateEqualizerMessage,
    UpdateTabMetadataMessageData,
} from "../types/messages"
import {
    START_RECORDING_MESSAGE,
    STOP_RECORDING_MESSAGE,
    TAB_EQ_INITIALIZED_MESSAGE,
    UPDATE_EQ_BACKEND,
    UPDATE_EQ_UI,
    UPDATE_TAB_METADATA,
} from "../types/constants"

export const useActiveTabs = () => {
    const [tabs, setTabs] = useState<Map<number, TabCardProps>>(new Map())

    useEffect(() => {
        const messageListener = (
            message: Message,
            sender: chrome.runtime.MessageSender
        ) => {
            // console.log(`Received tab data in React app: `, message)

            switch (message.type) {
                case START_RECORDING_MESSAGE: {
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
                case TAB_EQ_INITIALIZED_MESSAGE:
                case UPDATE_EQ_BACKEND:
                case UPDATE_EQ_UI: {
                    setTabs((prev) => {
                        const data = message.data as UpdateEqualizerMessage
                        const newTabs = new Map(prev)

                        newTabs.set(data.tabId, {
                            ...prev.get(data.tabId)!, // This is wrong or atleast unsafe
                            filters: data.filters,
                        })

                        return newTabs
                    })
                    break
                }
                case UPDATE_TAB_METADATA: {
                    const data = message.data as UpdateTabMetadataMessageData

                    setTabs((prev) => {
                        const newTabs = new Map(prev)
                        newTabs.set(data.tab.id!, {
                            ...prev.get(data.tab.id!)!, // This is wrong or atleast unsafe
                            title: data.tab.title!,
                            url: data.tab.url!,
                        })
                        return newTabs
                    })
                    break
                }
                case STOP_RECORDING_MESSAGE: {
                    const data = message.data as StopRecordingMessageData
                    setTabs((prev) => {
                        const newTabs = new Map(prev)

                        newTabs.delete(data.tabId)

                        return newTabs
                    })
                    break
                }
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
