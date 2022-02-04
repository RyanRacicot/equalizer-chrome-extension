
document.addEventListener("DOMContentLoaded", main, false)

let sliderIDs = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"]

var port
var tabID

async function main() {
  port = chrome.extension.connect({
    name: "Tab Equalizer",
  })

  try {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      tabID = tabs[0].id
      port.postMessage({ action: "init", tabID: tabID })

      port.onMessage.addListener((msg) => {
        switch (msg.action) {
          case "init":
            for (let sliderID in msg.filters) {
              setSliderValue(sliderID, msg.filters[sliderID].gain)
            }
            togglePowerIndicator(msg.enabled)
            break
          case "power":
            togglePowerIndicator(msg.enabled)
            break
          default:
        }
      })

      document.querySelectorAll(".gain-slider").forEach((slider) => {
        slider.oninput = function () {
          var sliderId = this.getAttribute("id")
          var sliderValue = this.value
          if (sliderId != "master")
            $("label[for='" + sliderId + "']")[0].innerHTML = sliderValue + "dB"
          sendFreqSpecificGainMessage(sliderId, sliderValue)
          sliderValuesChanged()
        }
      })

      document.getElementById("save-default").onclick = async () => {
        port.postMessage({ action: "save-default", tabID: tabID })
        savedDefaults()
      }

      document.getElementById("power").onclick = async () => {
        port.postMessage({ action: "power", tabID: tabID })
      }

      document.getElementById("reset").onclick = async () => {

        for (var i = 0; i < sliderIDs.length; i++) {
          if ($("#" + sliderIDs[i]).val() != 0) {
            sliderValuesChanged()
          }
          sendFreqSpecificGainMessage(sliderIDs[i], 0)
          $("#" + sliderIDs[i]).val(0)
          $("label[for='" + sliderIDs[i] + "']").text("0dB")
        }
      }

      function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
        port.postMessage({
          action: "gain-slider",
          slider_index: sliderNumber,
          value: gainValue,
          tabID: tabID,
        })
      }

      function setSliderValue(sliderID, value) {
        $("#" + sliderID).val(value)
        $("label[for='" + sliderID + "']").text(value + "dB")
      }

      function togglePowerIndicator(enabled) {
        var powerButton = $("#power-icon")

        if (!enabled) {
          powerButton.css({ fill: "#ff0000" })
        } else {
          powerButton.css({ fill: "#00cc77" })
        }
      }

      function sliderValuesChanged() {
        let defaultsButton = $("#save-default")
        // If values already changed
        if (defaultsButton.hasClass("sliders-unchanged")) {
          // Hide save-default
          $("#save-default").toggleClass("sliders-changed sliders-unchanged")
        }
      }

      function savedDefaults() {
        console.log('Saved defaults, updating button text')
        document.getElementById("save-default").innerText = "Saved!"
      }
    })
  } catch (e) {
    console.error("Error initializing Chrome Equalizer extension.", e)
  }
}
