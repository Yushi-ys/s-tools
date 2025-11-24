// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  platform: process.platform,

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

  settings: {
    autoStart: {
      // 允许自启动
      enableAutoStart: () => ipcRenderer.invoke("enable-auto-start"),
      // 禁止自启动
      disableAutoStart: () => ipcRenderer.invoke("disable-auto-start"),
      // 查看自启动状态
      checkAutoStartStatus: () => ipcRenderer.invoke("check-auto-start-status"),
    },
    shortCuts: {
      // 禁用全局快捷键
      disableGlobalShortcuts: () =>
        ipcRenderer.invoke("disable-global-shortcuts"),
      // 启用全局快捷键
      enableGlobalShortcuts: (shortcut) =>
        ipcRenderer.invoke("enable-global-shortcuts", shortcut),
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
