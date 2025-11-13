// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),

  // 剪贴板监控
  startClipboardMonitoring: () =>
    ipcRenderer.send("start-clipboard-monitoring"),
  stopClipboardMonitoring: () => ipcRenderer.send("stop-clipboard-monitoring"),
  getClipboardText: () => ipcRenderer.invoke("get-clipboard-text"),

  // 剪贴板事件监听
  onClipboardChange: (callback) => {
    ipcRenderer.on("clipboard-change", (event, data) => {
      callback(data);
    });
  },

  // 移除剪贴板监听器
  removeClipboardListeners: () => {
    ipcRenderer.removeAllListeners("clipboard-change");
  },

  // 通用通信方法
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  db: {
    getAllClipboardData: (limit) =>
      ipcRenderer.invoke("database-clipBoardData-get-all", limit),
    addClipboardData: (data) =>
      ipcRenderer.invoke("database-clipBoardData-add", data),
    getClipboardCount: () =>
      ipcRenderer.invoke("database-clipBoardData-get-count"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
