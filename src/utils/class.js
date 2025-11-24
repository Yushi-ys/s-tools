const AutoLaunch = require("auto-launch");
const { app } = require("electron");

class AutoStartManager {
  
  constructor() {
    this.autoLauncher = new AutoLaunch({
      name: "sTools", // 应用名称
      path: app.getPath("exe"), // 应用可执行文件路径
      isHidden: true, // 启动时是否隐藏窗口
    });
  }

  // 启用开机自启动
  async enableAutoStart() {
    try {
      if (!(await this.autoLauncher.isEnabled())) {
        await this.autoLauncher.enable();
        console.log("✅ 开机自启动已启用");
        return true;
      }
      console.log("ℹ️ 开机自启动已启用");
      return true;
    } catch (error) {
      console.error("❌ 启用开机自启动失败:", error);
      return false;
    }
  }

  // 禁用开机自启动
  async disableAutoStart() {
    try {
      if (await this.autoLauncher.isEnabled()) {
        await this.autoLauncher.disable();
        console.log("✅ 开机自启动已禁用");
        return true;
      }
      console.log("ℹ️ 开机自启动已禁用");
      return true;
    } catch (error) {
      console.error("❌ 禁用开机自启动失败:", error);
      return false;
    }
  }

  // 检查自启动状态
  async checkAutoStartStatus() {
    try {
      const isEnabled = await this.autoLauncher.isEnabled();
      console.log("自启动状态:", isEnabled ? "已启用" : "已禁用");
      return isEnabled;
    } catch (error) {
      console.error("❌ 检查自启动状态失败:", error);
      return false;
    }
  }
}

module.exports = new AutoStartManager();
