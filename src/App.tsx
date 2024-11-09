import React, { useState } from "react"
import { useActiveTabs } from "./hooks/useActiveTabs"
import { TabCard } from "./components/TabCard/TabCard"

const App: React.FC = () => {
    const activeTabs = useActiveTabs()

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Tab Equalizer</h1>
            {activeTabs.length === 0 ? (
                <p className="text-gray-500">No active recordings</p>
            ) : (
                <div className="space-y-2">
                    {activeTabs.map((tab) => (
                        <TabCard key={tab.id} {...tab} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default App
