import React from "react"
import {
    STOP_RECORDING_MESSAGE,
    UPDATE_EQ_BACKEND,
} from "../../types/constants"
import { TabCardProps } from "../../types/TabCardProps"
import { UpdateEqualizerMessage } from "../../types/messages"
import { Filters } from "../../types/Filter"
import styles from "./TabCard.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync, faTimes } from "@fortawesome/free-solid-svg-icons"

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

    const focusTab = () => {
        chrome.tabs.update(id, {
            active: true,
        })
    }

    return (
        <div className={styles.tabcard}>
            <div className="p-4 bg-white rounded-lg shadow mb-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className={styles.header}>
                        <div className={styles.headerText} onClick={focusTab}>
                            <h3 className={styles.title}>{title}</h3>
                            <p
                                className={
                                    styles.url +
                                    " text-sm text-gray-500 truncate"
                                }
                            >
                                {url}
                            </p>
                        </div>
                        <FontAwesomeIcon
                            className={styles.closeIcon}
                            icon={faTimes}
                            onClick={sendStopRecordingMessage}
                        />
                    </div>
                    {filters && (
                        <div className={styles.filters}>
                            {Object.entries(filters).map(([id, filter]) => (
                                <div className={styles.filter}>
                                    <input
                                        type="range"
                                        min="-40"
                                        max="20"
                                        value={filter.gain}
                                        id={id}
                                        step=".1"
                                        list="volsettings"
                                        onInput={onSliderUpdate}
                                        className={styles.inputSlider}
                                    />
                                    <p className={styles.frequencyLabel}>
                                        {filter.frequency}
                                        {filter.frequency < 1000 ? "Hz" : "kHz"}
                                    </p>
                                </div>
                            ))}

                            <FontAwesomeIcon
                                className={styles.resetIcon}
                                icon={faSync}
                                onClick={resetFilters}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
