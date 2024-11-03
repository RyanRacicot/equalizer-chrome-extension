export async function getStorage(key: string): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (value) => {
            resolve(value[key])
        })
    })
}

export async function setStorage(key: string, value: any) {
    console.debug(`Setting key: ${key} to value: ${value} in local storage.`)
    await chrome.storage.local.set({
        [key]: value,
    })
}
