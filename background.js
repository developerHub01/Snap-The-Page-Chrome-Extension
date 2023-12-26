// let allImageLinks = null;

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"],
//   });
// });

// // get data from content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.from === "content" && message.data) {
//     console.log(message.data);
//     allImageLinks = message.data;
//   }
// });

// // get requested message from popup.js
// chrome.runtime.onConnect.addListener((port) => {
//   // check port name
//   if (port.name === "popup") {
//     // get message request ================
//     port.onMessage.addListener((message) => {
//       if (message.action === "getImagesList") {
//         port.postMessage({ data: allImageLinks });
//       }
//     });
//   }
// });
