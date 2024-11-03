function openOptions() {
  return new Promise(async (resolve) => {
    getStorage("optionTabId")
      .then((optionTabId) => {
        console.log(
          `Attempting to find already open optionTabId: ${optionTabId}`
        )

        getOptionTab(optionTabId)
          .then((optionTab) => {
            console.log(`Got optionTab: `, optionTab)
            resolve(optionTab)
          })
          .catch((e) => {
            console.log(`Creating new optionTab`)
            chrome.tabs.create(
              {
                pinned: true,
                active: false, // <--- Important
                url: `chrome-extension://${chrome.runtime.id}/options.html`,
              },
              (tab) => {
                console.log(`Opening optionsTab with ID` - tab.id)
                resolve(tab)
              }
            )
          })
      })
      .catch((e) => {
        console.error(
          `No optionTabId found in local storage: ${e} - Creating new one`
        )
        chrome.tabs.create(
          {
            pinned: true,
            active: false, // <--- Important
            url: `chrome-extension://${chrome.runtime.id}/options.html`,
          },
          (tab) => {
            console.log(`Opening optionsTab with ID` - tab.id)
            resolve(tab)
          }
        )
      })
  })
}

const handleOptionsTabNotExists = () => {
  const error = chrome.runtime.lastError
  if (error) {
    throw new Error(error)
  }
}

const getOptionTab = async (optionTabId) => {
  const optionTab = await chrome.tabs.get(optionTabId)
  try {
    handleOptionsTabNotExists()
    return optionTab
  } catch (e) {
    console.error(`Failed to get optionTab: ${e}`)
  }

  return undefined
}

function removeTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId).then(resolve).catch(resolve)
  })
}

function executeScript(tabId, file) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: [file],
      },
      () => {
        resolve()
      }
    )
  })
}

function insertCSS(tabId, file) {
  return new Promise((resolve) => {
    chrome.scripting.insertCSS(
      {
        target: { tabId },
        files: [file],
      },
      () => {
        resolve()
      }
    )
  })
}

function sendMessageToTab(tabId, data) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, data, null, (res) => {
      resolve(res)
    })
  })
}

function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        resolve(value)
      }
    )
  })
}

chrome.action.onClicked.addListener(async (currentTab) => {
  console.log("Current Tab", currentTab)

  // Is it record only one tab at the same time?
  // const optionTabId = await getStorage("optionTabId");
  // if (optionTabId) {
  //   await removeTab(optionTabId);
  // }

  // Whether there has audio on the current tab ?
  if (currentTab.audible) {
    // You can save the current tab id to cache
    await setStorage("currentTabId", currentTab.id)

    // You can inject code to the current page
    await executeScript(currentTab.id, "content.js")
    await insertCSS(currentTab.id, "content.css")

    await sleep(500)

    // Open the option tab
    const optionTab = await openOptions().catch((e) => {
      console.error(`Error opening optionsTab: ${e}`)
    })
    console.log("Option tab", optionTab)

    // You can save the option tab id to cache
    await setStorage("optionTabId", optionTab.id)

    // For some reason this is completely necessary for the audio stream to setup correctly.
    await sleep(500)

    // You can pass some data to option tab
    await sendMessageToTab(optionTab.id, {
      type: "START_RECORD",
      data: { currentTab: currentTab },
    })
  } else {
    console.log("No Audio")
  }
})

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const currentTabId = await getStorage("currentTabId")
  const optionTabId = await getStorage("optionTabId")

  // When the current tab is closed, the option tab is also closed by the way
  if (currentTabId === tabId && optionTabId) {
    await removeTab(optionTabId)
  }
})
