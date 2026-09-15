# 开发指南

写给自己看的开发备忘，也给别人参考。

---

## 日常开发流程

### 启动顺序

```
1. 开 MySQL（确保服务在跑）
2. 开 Redis（可选，没配也能跑）
3. cd server && npm run start:dev    ← 后端热重载
4. HBuilderX 打开 12/ 目录，运行到浏览器/小程序
```

### 端口占用

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 3000 | NestJS |
| H5 前端 | 5173 / 随机 | HBuilderX 内置服务器 |
| 小程序 | 不占用 | 微信开发者工具 |

---

## 内网穿透（给手机/别人测试）

### 用 cpolar（推荐，免费）

1. 下载 [cpolar](https://dashboard.cpolar.com/)，注册账号
2. 命令行：`cpolar http 3000`
3. 拿到公网地址，比如 `http://xxxx.cpolar.top`
4. 改 `12/utils/config.js`：

```javascript
const ENV = 'tunnel'
const TUNNEL_URL = 'http://xxxx.cpolar.top/v1'  // 注意要加 /v1
```

5. 重新编译前端，手机扫码或浏览器打开即可

### 注意

- cpolar 免费版每次重启地址会变，要重新改配置
- 后端 `main.ts` 里 CORS 开了 `origin: '*'`，所以穿透过来不会跨域
- 如果后端跑在 WSL 里，cpolar 也要在 WSL 里开，不然连不上 localhost

---

## 环境切换

前端环境在 `12/utils/config.js` 里改：

```javascript
const ENV = 'local'     // 本地开发
const ENV = 'tunnel'    // 内网穿透
const ENV = 'prod'      // 生产环境
```

后端环境在 `server/.env` 里配，不会提交到仓库。

---

## 数据库相关

### 重置数据库

```bash
cd server
mysql -u root -p weiyu < database.sql
```

### 修改表结构

目前用的是 `synchronize: false`，改实体后需要：

1. 手动改 SQL 脚本
2. 或者临时改成 `synchronize: true` 让 TypeORM 自动同步（**仅开发时！**）
3. 生产环境用 migration（目前还没写）

---

## 代码规范（尽量遵守）

- 后端：TypeScript，接口返回统一 `{ code, message, data }`
- 前端：Vue 3 Composition API，状态用 reactive
- 提交信息：简单明了，比如 `feat: 添加菜品搜索`、`fix: 购物车数量不对`

---

## 踩坑记录

### 1. uni-app H5 跨域

后端已经开了 CORS，`origin: '*'`。如果还有问题，检查是不是请求地址写错了（少了 `/v1` 前缀）。

### 2. 微信小程序真机调试连不上后端

- 检查手机和后端是不是在同一个局域网
- 用 cpolar 穿透后，小程序里要开"不校验合法域名"
- 详情 → 本地设置 → 勾选"不校验合法域名..."

### 3. TypeORM raw SQL 字段映射

DishService 里有些查询用了 `getRawMany()`，返回的字段名带表前缀（`dish_name`），和实体定义（`name`）不一致。目前是在代码里手动映射的，后面可以统一处理。

### 4. 图片上传

目前存在 `server/uploads/`，通过 `/uploads/xxx.jpg` 访问。生产环境建议上云存储。

---

## 文件说明

| 文件 | 作用 |
|------|------|
| `12/utils/config.js` | 前端环境配置（API地址等） |
| `12/utils/request.js` | 请求拦截器（加token、处理401） |
| `server/.env` | 后端环境配置（数据库、JWT等） |
| `server/database.sql` | 数据库初始化 + 种子数据 |
| `server/src/main.ts` | 后端入口（端口、CORS、静态文件） |
