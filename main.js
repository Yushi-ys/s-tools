const {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  Tray,
  Menu,
  nativeImage,
} = require("electron");
const path = require("path");

const databaseService = require("./src/db/db.js");

const isDev = process.env.NODE_ENV === "dev";

// 剪贴板监控相关变量
let clipboardMonitoringInterval = null;
let mainWindow = null;
let appTray = null;

// 创建托盘图标
const createTray = () => {
  try {
    let trayIconPath;

    if (isDev) {
      trayIconPath = path.join(process.cwd(), "public", "icon.jpg");
    } else {
      trayIconPath = path.join(process.resourcesPath, "public", "icon.jpg");
      if (!require("fs").existsSync(trayIconPath)) {
        trayIconPath = path.join(__dirname, "public", "icon.jpg");
      }
    }

    console.log("托盘图标路径:", trayIconPath);

    let trayIcon;
    if (require("fs").existsSync(trayIconPath)) {
      trayIcon = nativeImage.createFromPath(trayIconPath);
    } else {
      console.log("未找到图标文件，使用默认图标");
      trayIcon = nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      );
    }

    appTray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

    appTray.setToolTip("sTools");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示窗口",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: "separator" },
      {
        label: "退出 sTools",
        click: () => {
          closeAppWithDataSave();
        },
      },
    ]);

    appTray.setContextMenu(contextMenu);

    appTray.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    appTray.on("double-click", () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error("创建托盘失败:", error);
  }
};

const closeAppWithDataSave = () => {
  // 设置退出标志
  app.isQuitting = true;

  if (mainWindow) {
    console.log("开始保存数据并退出...");

    // 发送保存数据信号到渲染进程
    mainWindow.webContents.send("toggle-window-loading-changed");

    // 监听保存完成事件
    const saveCompleteHandler = () => {
      console.log("数据保存完成，退出应用");

      // 清理监听器
      ipcMain.removeListener("save-data-complete", saveCompleteHandler);

      // 清理资源
      stopClipboardMonitoring();

      // 销毁托盘
      if (appTray) {
        appTray.destroy();
        appTray = null;
      }

      // 退出应用
      app.quit();
    };

    ipcMain.once("save-data-complete", saveCompleteHandler);

    const timeoutId = setTimeout(() => {
      console.log("保存数据超时，强制退出");
      ipcMain.removeListener("save-data-complete", saveCompleteHandler);
      if (appTray) {
        appTray.destroy();
        appTray = null;
      }
      app.quit();
    }, 5000);

    // 清理超时定时器
    ipcMain.once("save-data-complete", () => {
      clearTimeout(timeoutId);
    });
  } else {
    app.quit();
  }
};

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
      console.error("剪贴板监控错误:", error);
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
    // 可选：设置任务栏图标
    icon: isDev
      ? path.join(process.cwd(), "public", "icon.jpg")
      : path.join(__dirname, "public", "icon.jpg"),
  });

  databaseService.initialize();

  if (isDev) {
    mainWindow.webContents.toggleDevTools();
    const loadPath = "http://localhost:3001/";
    mainWindow.loadURL(loadPath);
  } else {
    // mainWindow.webContents.toggleDevTools();
    // 生产环境：修正路径
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }

  // 创建托盘
  createTray();

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

  ipcMain.on("window-close", () => {
    console.log("点击关闭按钮，隐藏到托盘");
    // 隐藏窗口而不是关闭
    mainWindow.hide();

    // 显示托盘通知
    if (appTray && process.platform === "win32") {
      appTray.displayBalloon({
        title: "sTools 仍在运行",
        content: "程序已最小化到系统托盘，右键托盘图标可以退出",
        iconType: "info",
      });
    }
  });

  ipcMain.on("app-quit", () => {
    // 从渲染进程请求退出应用
    closeAppWithDataSave();
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

  // 窗口关闭事件处理 - 阻止默认关闭行为
  mainWindow.on("close", (event) => {
    // 如果不是真正退出应用，就隐藏到托盘
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();

      // 显示托盘通知（Windows）
      if (appTray && process.platform === "win32") {
        appTray.displayBalloon({
          title: "sTools 仍在运行",
          content: "程序已最小化到系统托盘，右键托盘图标可以退出",
          iconType: "info",
        });
      }
    }
  });

  // 窗口关闭时清理资源
  mainWindow.on("closed", () => {
    stopClipboardMonitoring();
    if (appTray) {
      appTray.destroy();
      appTray = null;
    }
    mainWindow = null;
  });
};

// 设置应用退出标志
app.on("before-quit", (event) => {
  // 如果已经有退出标志，允许退出
  if (app.isQuitting) {
    return;
  }

  // 否则阻止退出，改为隐藏到托盘
  event.preventDefault();
  if (mainWindow) {
    mainWindow.hide();
  }
});

app.whenReady().then(() => {
  createWindow();
});

// 监听窗口关闭 - 不自动退出，让托盘保持应用运行
app.on("window-all-closed", () => {
  stopClipboardMonitoring();
  // 注释掉默认的退出逻辑，让托盘保持应用运行
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
});

// 监听窗口唤醒 (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// 应用退出前清理
app.on("will-quit", () => {
  stopClipboardMonitoring();
});
