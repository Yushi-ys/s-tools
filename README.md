# 翻译应用项目

## 技术栈
- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express (代理服务器)

## 启动步骤

### 1. 安装前端依赖
```bash
npm i
```

2. 启动后端代理服务
```bash
cd ./server/
node proxy-server.js
```

3. 返回项目根目录
```bash
cd ../
```

4. 启动前端开发服务器
```bash
npm run dev
```

5. 项目结构
```text
项目根目录/
├── server/
│   └── proxy-server.js    # 后端代理服务器
├── src/                   # 前端源码
└── package.json
```