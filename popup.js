document.addEventListener('DOMContentLoaded', listenerEvents, false);

function listenerEvents() {
  console.log('Pop-Up Window Content Loaded. Binding onChange functions');

  $(".gain-slider").each(function (){
    $(this).on("change", function() {
      console.log($(this).attr("id"), 'is now at', $(this).val())
      sendFreqSpecificGainMessage($(this).attr("id"), parseFloat($(this).val()))
    });
  });
  
  document.getElementById("power").onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: "power"}, function(response) {
        //   alert(response.farewell);
      });
    });
  }

  function sendFreqSpecificGainMessage(sliderNumber, gainValue) {
    // console.log(sliderNumber, gainValue)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: "gain-slider", slider_index: sliderNumber ,value: gainValue}, function(response) {
        // alert(response);
      });
    });
  }
}
