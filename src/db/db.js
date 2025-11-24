const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const getDefaultShortKey = () => {
  if (typeof window !== "undefined" && window.electronAPI.platform) {
    return window.electronAPI.platform === "darwin" ? "Command+1" : "Alt+1";
  }
  return "Alt+1";
};

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initialize() {
    try {
      let dbPath;
      console.log("当前应用的环境", process.env.NODE_ENV);
      const projetName =
        process.env.NODE_ENV === "dev" ? "stools-db-dev" : "stools-db-prod";

      const projectRoot = process.cwd(); // 当前项目根目录
      const projectParentDir = path.dirname(projectRoot); // 项目父级目录

      dbPath = path.join(projectParentDir, projetName, "app.db");

      // 确保目录存在
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const fullPath = path.resolve(dbPath);
      console.log("数据库完整路径:", fullPath);
      this.db = new Database(fullPath);
      this.createTables();

      this.initializeSystemSetting();
      console.log("数据库初始化成功");
    } catch (error) {
      console.error("数据库初始化失败：", error);
    }
  }

  /**
   * 创建所有表
   */
  createTables() {
    // 开始事务
    this.db.exec("BEGIN TRANSACTION");

    try {
      // 创建剪切板数据表
      const createClipboardTable = `
        CREATE TABLE IF NOT EXISTS clipboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        json_data TEXT NOT NULL,
        update_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

      // 修改系统配置表，添加唯一约束确保只有一条数据
      const createSystemSettingTable = `
        CREATE TABLE IF NOT EXISTS systemSetting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        json_data TEXT NOT NULL,
        update_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

      this.db.exec(createClipboardTable);
      this.db.exec(createSystemSettingTable);

      // 提交事务
      this.db.exec("COMMIT");
      console.log("已成功创建所有表");
    } catch (error) {
      // 回滚事务
      this.db.exec("ROLLBACK");
      console.error("创建表时出错：", error);
      throw error;
    }
  }

  /**
   * 获取所有剪切板数据
   * @param
   * @returns
   */
  getAllClipboardData(limit = 1000) {
    try {
      const stmt = this.db.prepare(
        "SELECT * FROM clipboard ORDER BY update_at DESC LIMIT ?"
      );
      const rows = stmt.all(limit);

      // 解析 JSON 数据
      return rows.map((row) => ({
        ...row,
        json_data: JSON.parse(row.json_data),
      }));
    } catch (error) {
      console.error("获取剪切板数据失败：", error);
      return [];
    }
  }

  /**
   * 存储剪切板数据
   * @param {*} jsonData
   * @returns
   */
  addClipboardData(jsonData) {
    try {
      const jsonString = JSON.stringify(jsonData);
      const stmt = this.db.prepare(
        "INSERT INTO clipboard (json_data) VALUES (?)"
      );
      stmt.run(jsonString);
      console.log("addClipboardData sql执行成功");
      return {
        success: true,
      };
    } catch (error) {
      console.error("存储剪切板数据失败：", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 获取数据总数
  getClipboardCount() {
    try {
      const stmt = this.db.prepare("SELECT COUNT(*) as count FROM clipboard");
      const result = stmt.get();
      return result.count;
    } catch (error) {
      console.error("获取数据总数失败：", error);
      return 0;
    }
  }

  /**
   * 获取系统配置（只返回一条数据）
   * @returns {Object|null} 系统配置对象，如果没有则返回null
   */
  getSystemSetting() {
    try {
      const stmt = this.db.prepare(
        "SELECT * FROM systemSetting ORDER BY id ASC LIMIT 1"
      );
      const row = stmt.get();

      if (row) {
        return {
          ...row,
          json_data: JSON.parse(row.json_data),
        };
      }
      return null;
    } catch (error) {
      console.error("获取系统配置失败：", error);
      return null;
    }
  }

  /**
   * 更新或插入系统配置（确保只有一条数据）
   * @param {Object} jsonData 系统配置数据
   * @returns {Object} 操作结果
   */
  updateSystemSetting(jsonData) {
    try {
      const jsonString = JSON.stringify(jsonData);

      // 开始事务
      this.db.exec("BEGIN TRANSACTION");

      try {
        // 首先检查是否存在系统配置
        const checkStmt = this.db.prepare(
          "SELECT id FROM systemSetting LIMIT 1"
        );
        const existing = checkStmt.get();

        if (existing) {
          // 如果存在，则更新
          const updateStmt = this.db.prepare(
            "UPDATE systemSetting SET json_data = ?, update_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          updateStmt.run(jsonString, existing.id);
          console.log("更新系统配置成功");
        } else {
          // 如果不存在，则插入
          const insertStmt = this.db.prepare(
            "INSERT INTO systemSetting (json_data) VALUES (?)"
          );
          insertStmt.run(jsonString);
          console.log("插入系统配置成功");
        }

        // 提交事务
        this.db.exec("COMMIT");

        return {
          success: true,
          message: existing ? "系统配置更新成功" : "系统配置创建成功",
        };
      } catch (error) {
        // 回滚事务
        this.db.exec("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("更新系统配置失败：", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 初始化默认系统配置
   * @param {Object} defaultConfig 默认配置
   * @returns {Object} 操作结果
   */
  initializeSystemSetting(defaultConfig = {}) {
    try {
      const existing = this.getSystemSetting();

      if (!existing) {
        const defaultSettings = {
          autoStart: false,
          shortKey: getDefaultShortKey(),
          ...defaultConfig,
        };

        return this.updateSystemSetting(defaultSettings);
      }

      return {
        success: true,
        message: "系统配置已存在，无需初始化",
      };
    } catch (error) {
      console.error("初始化系统配置失败：", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 删除系统配置
   * @returns {Object} 操作结果
   */
  deleteSystemSetting() {
    try {
      const stmt = this.db.prepare("DELETE FROM systemSetting");
      stmt.run();
      console.log("删除系统配置成功");
      return {
        success: true,
        message: "系统配置已删除",
      };
    } catch (error) {
      console.error("删除系统配置失败：", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 更新特定的系统配置字段（部分更新）
   * @param {Object} updates 要更新的字段
   * @returns {Object} 操作结果
   */
  updateSystemSettingField(updates) {
    try {
      const currentSetting = this.getSystemSetting();

      if (!currentSetting) {
        return this.updateSystemSetting(updates);
      }

      // 合并现有配置和更新字段
      const mergedSetting = {
        ...currentSetting.json_data,
        ...updates,
      };

      return this.updateSystemSetting(mergedSetting);
    } catch (error) {
      console.error("更新系统配置字段失败：", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new DatabaseService();
