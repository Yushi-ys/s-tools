// 这是主进程 主要的一个工作就是打开渲染进程
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        webPreferences: {
            // 使用 path.resolve 好处
            // 1：Windows 使用反斜杠 (\)，而 Unix 系统使用正斜杠 (/)。path.resolve 会自动处理这些差异，确保路径在不同操作系统上一致。
            // 2：path.resolve 会将路径解析为绝对路径，确保在不同操作系统上都能找到正确的文件。
            preload: path.resolve(process.cwd(), 'preload.js')
        },
        frame: false
    })
    mainWindow.webContents.toggleDevTools()
    // const loadPath = path.resolve(process.cwd(), 'index.html')
    const loadPath = 'http://localhost:5173/'
    console.log('loadpath', loadPath);

    mainWindow.loadURL(loadPath)

    ipcMain.on('window-minimize', () => {
        mainWindow.minimize()
    })

    ipcMain.on('window-maximize', () => {
        // 如果已经最大化窗口，则恢复成之前的样子
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    })

    ipcMain.on('window-close', () => {
        mainWindow.close()
    })

    ipcMain.on('toggle-devtools', () => {
        if (mainWindow) {
            if (mainWindow.webContents.isDevToolsOpened()) {
                mainWindow.webContents.closeDevTools();
            } else {
                mainWindow.webContents.openDevTools();
            }
        }
    });
}

app.whenReady().then(() => {
    createWindow()
})

// 监听窗口关闭
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    console.log('当前系统', process.platform);
})

// 监听窗口唤醒
app.on('activate', () => {
    createWindow()
})