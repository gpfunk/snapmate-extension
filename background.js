const listener = (request, sender, sendResponse) => {
  if (request.action === "health") {
    sendResponse({ status: "ok" });
    return true;
  }

  if (request.action === "getData") {
    chrome.storage.local.get(request.key, (data) => {
      sendResponse(data[request.key]);
    });

    return true;
  }

  if (request.action === "setData") {
    chrome.storage.local.set({ [request.key]: request.value }, () => {
      sendResponse({ status: "ok" });
    });

    return true;
  }
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(listener);
chrome.runtime.onMessageExternal.addListener(listener);
