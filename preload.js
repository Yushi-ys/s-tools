// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // 通用通信方法
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);