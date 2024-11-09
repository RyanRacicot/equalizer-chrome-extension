import React from "react"
import {
    STOP_RECORDING_MESSAGE,
    UPDATE_EQ_BACKEND,
} from "../../types/constants"
import { TabCardProps } from "../../types/TabCardProps"
import { UpdateEqualizerMessage } from "../../types/messages"
import { Filters } from "../../types/Filter"
import styles from "./TabCard.module.scss"

export const TabCard: React.FC<TabCardProps> = ({
    id,
    url,
    title,
    isRecording,
    filters,
}) => {
    console.log(
        `Creating tabCard with props: `,
        id,
        url,
        title,
        isRecording,
        filters
    )

    const sendStopRecordingMessage = () => {
        chrome.runtime.sendMessage({
            type: STOP_RECORDING_MESSAGE,
            data: { tabId: id },
        })
    }

    const resetFilters = () => {
        const castFilters = filters as Filters

        Object.entries(castFilters).forEach(([filterId, filter]) => {
            filter.gain = 0
        })

        let updateEqMessage: UpdateEqualizerMessage = {
            tabId: id,
            filters: castFilters,
        }

        chrome.runtime.sendMessage({
            type: UPDATE_EQ_BACKEND,
            data: updateEqMessage,
        })
    }

    const onSliderUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        let updatedFilters = filters!

        event.target.id

        updatedFilters[event.target.id].gain = event.target.valueAsNumber

        let updateEqMessage: UpdateEqualizerMessage = {
            tabId: id,
            filters: updatedFilters,
        }

        chrome.runtime.sendMessage({
            type: UPDATE_EQ_BACKEND,
            data: updateEqMessage,
        })
    }

    return (
        <div className={styles.tabCard}>
            <div className="p-4 bg-white rounded-lg shadow mb-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{url}</p>
                    </div>
                    {filters && (
                        <div className="filters">
                            {Object.entries(filters).map(([id, filter]) => (
                                <div>
                                    {filter.frequency} Hz
                                    <input
                                        type="range"
                                        min="-20"
                                        max="20"
                                        value={filter.gain}
                                        id={id}
                                        step="1"
                                        list="volsettings"
                                        onInput={onSliderUpdate}
                                    />
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetFilters}
                                    className="ml-2 px-2 py-1 text-sm rounded "
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={sendStopRecordingMessage}
                                    className={`ml-2 px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600`}
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
