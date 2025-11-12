import Database from "better-sqlite3";

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initialize(dbPath = "app.db") {
    try {
      this.db = new Database(dbPath);
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
   * @param {*} limit 数量限制
   * @returns
   */
  getAllClipboardData(limit = 1000) {
    try {
      const stmt = this.db.prepare(
        "SELECT * FROM clipboard ORDER BY created_at DESC LIMIT ?"
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
}

export default new DatabaseService();
