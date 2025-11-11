// 这是主进程 主要的一个工作就是打开渲染进程
import { app, BrowserWindow, ipcMain, clipboard } from "electron";
import path from "path";
import log from "electron-log";
import fs from "fs";
import { getCurrentDate, Logger } from "@/utils";

export const isDev = process.env.NODE_ENV === "dev";

// 剪贴板监控相关变量
let clipboardMonitoringInterval: any = null;

const startClipboardMonitoring = (mainWindow: BrowserWindow) => {
  if (clipboardMonitoringInterval) {
    return;
  }

  let lastClipboardText = clipboard.readText();
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

        Logger("检测到了 文本 复制", {
          text: currentText,
        });

        return;
      }

      // 检查图片变化
      const currentImage = clipboard.readImage();
      if (!currentImage.isEmpty()) {
        const imageSize = currentImage.getSize();
        const currentImageHash = `${imageSize.width}x${imageSize.height}`;

        if (currentImageHash !== lastImageHash) {
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

          Logger("检测到了 图像 复制", {
            width: imageSize.width,
            height: imageSize.height,
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
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      // 使用 path.resolve 好处
      // 1：Windows 使用反斜杠 (\)，而 Unix 系统使用正斜杠 (/)。path.resolve 会自动处理这些差异，确保路径在不同操作系统上一致。
      // 2：path.resolve 会将路径解析为绝对路径，确保在不同操作系统上都能找到正确的文件。
      preload: isDev
        ? path.join(process.cwd(), "preload.js")
        : path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
  });

  if (isDev) {
    mainWindow.webContents.toggleDevTools();
    const loadPath = "http://localhost:5173/";
    mainWindow.loadURL(loadPath);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // 窗口控制
  ipcMain.on("window-minimize", () => {
    Logger("s-tools 最小化");
    mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    // 如果已经最大化窗口，则恢复成之前的样子
    if (mainWindow.isMaximized()) {
      Logger("s-tools 还原成之前的窗口大小", {
        size: mainWindow.getSize(),
        contentSize: mainWindow.getContentSize(),
        position: mainWindow.getPosition(),
      });
      mainWindow.unmaximize();
    } else {
      Logger("s-tools 最大化");
      mainWindow.maximize();
    }
  });

  ipcMain.on("window-close", () => {
    Logger("s-tools 关闭");
    mainWindow.close();
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

  // 窗口关闭时清理资源
  mainWindow.on("closed", () => {
    stopClipboardMonitoring();
  });
};

const initLog = () => {
  // 设置日志文件路径 - C盘Users目录下的utoolLog文件夹
  const userHome = process.env.HOME || process.env.USERPROFILE;
  const logDirectory = path.join(userHome!, "utoolLog");

  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  log.transports.file.resolvePathFn = () => {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD格式
    return path.join(logDirectory, `app-${dateString}.log`);
  };
};

app.whenReady().then(() => {
  initLog();
  Logger("s-tools 启动");
  createWindow();
});

// 监听窗口关闭
app.on("window-all-closed", () => {
  stopClipboardMonitoring();
  if (process.platform !== "darwin") {
    Logger("s-tools 关闭");
    app.quit();
  }
});

// 监听窗口唤醒
app.on("activate", () => {
  Logger("s-tools 被唤醒");
  createWindow();
});
