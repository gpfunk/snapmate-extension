export const getData = (key) => {
  return chrome.runtime.sendMessage({ action: "getData", key });
}

export const setData = (key, value) => {
  return chrome.runtime.sendMessage({ action: "setData", key, value })
}