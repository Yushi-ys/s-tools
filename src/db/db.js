const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initialize() {
    try {
      let dbPath;
      console.log("当前应用的环境", process.env.NODE_ENV);

      if (process.env.NODE_ENV === "dev") {
        const projectRoot = process.cwd(); // 当前项目根目录
        const projectParentDir = path.dirname(projectRoot); // 项目父级目录
        dbPath = path.join(projectParentDir, "stools-db-dev", "app.db");
      } else {
        // 生产环境：放在应用同级目录的 stools-db 文件夹中
        const appDir = path.dirname(app.getPath("exe"));
        dbPath = path.join(appDir, "stools-db-prod", "app.db");
      }

      // 确保目录存在
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const fullPath = path.resolve(dbPath);
      console.log("数据库完整路径:", fullPath);
      this.db = new Database(fullPath);
      this.createTables();
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

      this.db.exec(createClipboardTable);

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
}

module.exports = new DatabaseService();
