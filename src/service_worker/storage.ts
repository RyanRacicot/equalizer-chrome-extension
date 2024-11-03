export async function getStorage(key: string): Promise<any> {
    console.log(`Fetching key: ${key} from local storage.`)
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (value) => {
            resolve(value[key])
        })
    })
}

export async function setStorage(key: string, value: any) {
    console.log(`Setting key: ${key} to value: ${value} in local storage.`)
    await chrome.storage.local.set({
        [key]: value,
    })
}
