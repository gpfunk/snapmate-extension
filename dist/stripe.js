// src/config.json
var config_default = {
  app_url: "http://127.0.0.1:8787"
};

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
};

// src/store.js
var setData = (key, value) => {
  return chrome.runtime.sendMessage({ action: "setData", key, value });
};

// src/stripe.js
var { app_url } = config_default;
var findText = (el) => {
  if (!el) {
    return null;
  }
  if (el.nodeType === 3) {
    return el.textContent;
  }
  return findText(el.firstChild);
};
var create = async (chart) => {
  const values = chart.getElementsByTagName("text");
  const title = findText(chart.firstChild.nextSibling);
  const axis = {
    x: {
      min: values[0]?.textContent,
      max: values[1]?.textContent
    },
    y: {
      min: values[2]?.textContent,
      max: values[3]?.textContent
    }
  };
  const summary = {
    line0: chart.querySelector(`[data-testid="line-chart-summary-item-0"]`)?.textContent,
    line1: chart.querySelector(`[data-testid="line-chart-summary-item-1"]`)?.textContent
  };
  const canvas = chart.getElementsByTagName("canvas")[0];
  const getBoundsValue = (pos) => {
    return parseInt(canvas.parentNode.style.getPropertyValue(`--chart-${pos}`) || "0");
  };
  const bounds = {
    height: getBoundsValue("height"),
    width: getBoundsValue("width"),
    left: getBoundsValue("left"),
    top: getBoundsValue("top"),
    right: getBoundsValue("right"),
    bottom: getBoundsValue("bottom")
  };
  const image = canvas.toDataURL();
  const key = nanoid();
  const value = {
    image,
    axis,
    summary,
    title,
    bounds
  };
  await setData(key, value);
  window.open(`${app_url}/?key=${key}`);
};
var setupChart = (chart) => {
  const newElement = document.createElement("div");
  newElement.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="snapmate-logo">
      <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clip-rule="evenodd" />
    </svg>
  `;
  chart.style.position = "relative";
  newElement.addEventListener("click", () => {
    create(chart);
  });
  chart.insertAdjacentElement("afterbegin", newElement);
};
var setup = async (count = 0) => {
  const raw = document.querySelectorAll(`[data-moduleid]`);
  if (!raw.length) {
    if (count <= 10) {
      setTimeout(() => {
        setup(count + 1);
      }, 2000);
    }
    return;
  }
  const charts = [...raw].filter((el) => el.dataset?.moduleid?.endsWith("line-chart-module"));
  for (let chart of charts) {
    setupChart(chart);
  }
};
setup();
