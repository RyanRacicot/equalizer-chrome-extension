import Equalizer from "./Equalizer.js"

let eq

function tabCapture() {
  return new Promise((resolve) => {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      resolve(stream)
    })
  })
}

function sendMessageToTab(tabId, data) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, data, (res) => {
      resolve(res)
    })
  })
}

async function startRecord(tab) {
  console.log(`startRecord from options.js`)
  const stream = await tabCapture()

  if (stream) {
    // call when the stream inactive
    stream.oninactive = () => {
      window.close()
    }

    const context = new AudioContext()

    new Equalizer(context, stream).then((equalizer) => {
      eq = equalizer
    })
  } else {
    window.close()
  }
}

document.querySelectorAll(".gain-slider").forEach((slider) => {
  slider.oninput = function () {
    var sliderId = this.getAttribute("id")
    var sliderValue = this.value
    console.log(`Changed gain for slider: `, sliderId, ` to `, sliderValue)
    if (sliderId != "master")
      $("label[for='" + sliderId + "']")[0].innerHTML = sliderValue + "dB"
    eq.changeGain(sliderId, sliderValue)
  }
})

async function injectHTML(tab) {
  let newTabData = document.createTextNode(tab.title)
  document.getElementById("main").appendChild(newTabData)
}

// Receive data from Current Tab or Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, data } = request

  console.log(`Received tab data: `, data)

  document.querySelector("#tab-title").textContent = data.currentTab.title

  switch (type) {
    case "START_RECORD":
      startRecord(data.currentTab)
      injectHTML(data.currentTab)
      break
    default:
      break
  }

  sendResponse({})
})
