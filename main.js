const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");

const databaseService = require("./src/db/db.js");

const isDev = process.env.NODE_ENV === "dev";

// 剪贴板监控相关变量
let clipboardMonitoringInterval = null;

let mainWindow = null;

const startClipboardMonitoring = (mainWindow) => {
  if (clipboardMonitoringInterval) {
    return;
  }

  let lastClipboardText = clipboard.readText();
  let lastClipboardImage = clipboard.readImage();
  let lastImageHash = "";

  clipboardMonitoringInterval = setInterval(() => {
    try {
      // 检查文本变化
      const currentText = clipboard.readText();
      if (currentText && currentText !== lastClipboardText) {
        lastClipboardText = currentText;

        mainWindow.webContents.send("clipboard-change", {
          type: "text",
          text: currentText,
          timestamp: Date.now(),
        });
        return;
      }

      // 检查图片变化
      const currentImage = clipboard.readImage();
      if (!currentImage.isEmpty()) {
        const imageSize = currentImage.getSize();
        const currentImageHash = `${imageSize.width}x${imageSize.height}`;

        if (currentImageHash !== lastImageHash) {
          lastClipboardImage = currentImage;
          lastImageHash = currentImageHash;

          // 转换为 base64 发送
          const imageDataURL = currentImage.toDataURL();
          mainWindow.webContents.send("clipboard-change", {
            type: "image",
            image: imageDataURL,
            width: imageSize.width,
            height: imageSize.height,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      // 可以选择在多次错误后停止监控
    }
  }, 500);
};

const stopClipboardMonitoring = () => {
  if (clipboardMonitoringInterval) {
    clearInterval(clipboardMonitoringInterval);
    clipboardMonitoringInterval = null;
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: isDev
        ? path.join(process.cwd(), "preload.js")
        : path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      partition: "persist:main", // 使用持久化分区
    },
    frame: false,
  });

  databaseService.initialize();

  if (isDev) {
    mainWindow.webContents.toggleDevTools();
    const loadPath = "http://localhost:3001/";
    mainWindow.loadURL(loadPath);
  } else {
    mainWindow.webContents.toggleDevTools();
    // 生产环境：修正路径
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }

  // 窗口控制
  ipcMain.on("window-minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    // 如果已经最大化窗口，则恢复成之前的样子
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on("window-close", async () => {
    console.log("发送了事件");
    mainWindow.webContents.send("toggle-window-loading-changed");

    ipcMain.once("save-data-complete", () => {
      console.log("数据保存完成，关闭窗口");
      mainWindow.close();
    });
  });

  ipcMain.on("toggle-devtools", () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // 剪贴板监控
  ipcMain.on("start-clipboard-monitoring", () => {
    startClipboardMonitoring(mainWindow);
  });

  ipcMain.on("stop-clipboard-monitoring", () => {
    stopClipboardMonitoring();
  });

  ipcMain.handle("get-clipboard-text", () => {
    return clipboard.readText();
  });

  ipcMain.handle("database-clipBoardData-get-all", (event, limit = 1000) => {
    return databaseService.getAllClipboardData(limit);
  });

  ipcMain.handle("database-clipBoardData-add", (event, data) => {
    return databaseService.addClipboardData(data);
  });

  ipcMain.handle("database-clipBoardData-get-count", () => {
    return databaseService.getClipboardCount();
  });

  // 窗口关闭时清理资源
  mainWindow.on("closed", () => {
    stopClipboardMonitoring();
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();
});

// 监听窗口关闭
app.on("window-all-closed", () => {
  stopClipboardMonitoring();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 监听窗口唤醒
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});