import React from "react"
import { sendMessageToServiceWorker } from "../service_worker/tabs"
import { STOP_RECORDING_MESSAGE } from "../types/constants"
import { TabCardProps } from "../types/TabCardProps"

export const TabCard: React.FC<TabCardProps> = ({
    id,
    url,
    title,
    isRecording,
}) => {
    const sendStopRecordingMessage = () => {
        sendMessageToServiceWorker({
            type: STOP_RECORDING_MESSAGE,
            data: { tabId: id },
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
