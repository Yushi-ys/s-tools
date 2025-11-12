# tools 应用项目

## 技术栈
- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express (代理服务器)

## 启动步骤

1. 安装前端依赖
```bash
npm i
```

2. 启动后端代理服务
```bash
npm run start:node
```

3. 启动前端开发服务器
```bash
npm run start:electron
```

4. 项目结构
```text
项目根目录/
├── server/
│   └── proxy-server.js    # 后端代理服务器
├── src/                   # 前端源码
└── package.json
```
