import React, { useState } from "react"
import { useActiveTabs } from "./hooks/useActiveTabs"
import { TabCard } from "./components/TabCard/TabCard"
import styles from "./App.module.scss"

const App: React.FC = () => {
    const activeTabs = useActiveTabs()

    return (
        <div className={styles.appRoot}>
            <h1 className={styles.title}>Tab Equalizer</h1>
            {activeTabs.length === 0 ? (
                <p className="text-gray-500">No active tabs!</p>
            ) : (
                <div className={styles.tabsContainer}>
                    {activeTabs.map((tab) => (
                        <TabCard key={tab.id} {...tab} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default App
