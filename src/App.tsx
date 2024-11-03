import React, { useState } from "react"

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0)

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hello Extension</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App
