import React from "react"
import { sendMessageToRuntime, sendMessageToTab } from "../service_worker/tabs"
import { STOP_RECORDING_MESSAGE, UPDATE_EQ_BACKEND } from "../types/constants"
import { TabCardProps } from "../types/TabCardProps"
import { UpdateEqualizerMessage } from "../types/messages"

export const TabCard: React.FC<TabCardProps> = ({
    id,
    url,
    title,
    isRecording,
    filters,
}) => {
    const sendStopRecordingMessage = () => {
        sendMessageToRuntime({
            type: STOP_RECORDING_MESSAGE,
            data: { tabId: id },
        })
    }

    console.log(
        `Creating tabCard with props: `,
        id,
        url,
        title,
        isRecording,
        filters
    )

    const onSliderUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(`Updated slider with event: `, event)
        // TODO - Actually propagate the requested value back to the EQ, then back to this element so the value isn't stuck at filter.gain
        // Which should probably just happen after SHOULD_UPDATE_EQ_UI message or whatever it's called

        let updatedFilters = filters!

        event.target.id

        updatedFilters[event.target.id].gain = event.target.valueAsNumber

        let updateEqMessage: UpdateEqualizerMessage = {
            tabId: id,
            filters: updatedFilters,
        }

        console.log(`Sending event to runtime: ${id}`, updateEqMessage)

        chrome.runtime.sendMessage({
            type: UPDATE_EQ_BACKEND,
            data: updateEqMessage,
        })
    }

    return (
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
                                {filter.type} at frequency: {filter.frequency}{" "}
                                with gain: {filter.gain}
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
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {isRecording && (
                        <div className="flex items-center">
                            <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full mr-2" />
                            <span className="text-sm text-red-500">
                                Recording
                            </span>
                        </div>
                    )}
                    <button
                        onClick={sendStopRecordingMessage}
                        disabled={!isRecording}
                        className={`ml-2 px-2 py-1 text-sm rounded ${
                            isRecording
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Stop
                    </button>
                </div>
            </div>
        </div>
    )
}
