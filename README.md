# 味遇 · 积分点餐系统

一套给小型圈子用的积分制点餐系统。管理员发积分，顾客用积分点菜，没有真实支付，适合朋友、同事、社团内部用。

**在线演示**：TODO — 等部署了再填

---

## 预览

### 顾客端

| 登录页 | 首页 | 菜品详情 |
|--------|------|----------|
| ![登录](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/login.png) | ![首页](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/customer-home.png) | ![详情](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/dish-detail.png) |

| 购物车 | 下单 | 下单成功 |
|--------|------|----------|
| ![购物车](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/cart.png) | ![下单](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/checkout.png) | ![成功](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/order-success.png) |

### 管理员端

| 接单管理 | 菜品管理 | 菜品编辑 |
|----------|----------|----------|
| ![接单](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-orders.png) | ![菜品](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-dishes.png) | ![编辑](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-dish-edit.png) |

| 用户管理 | 积分调整 | 奖励管理 | 兑换审核 |
|----------|----------|----------|----------|
| ![用户](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-users.png) | ![积分](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-points.png) | ![奖励](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-rewards.png) | ![兑换](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/admin-exchange.png) |

### 系统架构

![架构图](https://raw.githubusercontent.com/YSkali/weiyu-ordering/main/docs/screenshots/architecture.png)

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- MySQL 8.0+
- HBuilderX（uni-app 前端）或 VSCode + 插件

### 1. 数据库

```bash
# 登录 MySQL，执行初始化脚本
mysql -u root -p < server/database.sql
```

### 2. 后端

```bash
cd server
cp .env.example .env
# 编辑 .env，填上你的数据库密码

npm install
npm run start:dev
```

后端默认跑在 `http://localhost:3000`，API 前缀 `/v1`。

### 3. 前端

用 HBuilderX 打开 `12/` 目录：

- **H5**：运行 → 运行到浏览器
- **微信小程序**：运行 → 运行到小程序模拟器

前端默认连 `localhost:3000`。如需内网穿透给手机测试，改 `12/utils/config.js` 里的 `ENV` 为 `tunnel` 并填上穿透地址。

### 4. 访问

启动后浏览器打开 `http://localhost:3000` 即可访问 H5 前端。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | uni-app (Vue 3 Composition API) |
| 后端 | NestJS 10 + TypeORM |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcrypt |
| 实时通知 | WebSocket (Socket.IO) |

---

## 默认账号

### 管理员账号

数据库初始化后自带 5 个管理员账户：

| 账号 | 密码 | 说明 |
|------|------|------|
| admin1 | 123456 | 管理员 1 |
| admin2 | 123456 | 管理员 2 |
| admin3 | 123456 | 管理员 3 |
| admin4 | 123456 | 管理员 4 |
| admin5 | 123456 | 管理员 5 |

> ⚠️ **安全提示**：部署后务必修改默认密码！

### 顾客账号

顾客端首次使用"账号+密码+口令"登录即自动注册：

| 字段 | 说明 |
|------|------|
| 账号 | 自定义，全局唯一 |
| 密码 | 自定义 |
| 口令 | 管理员设置的 `group_code` |

**口令机制**：口令是分组凭证，顾客输入哪个管理员的口令，就自动归属该管理员的组。不同组的顾客数据互不干扰。

---

## 核心功能

### 顾客端

- 浏览菜品（分类筛选、图片展示）
- 购物车管理
- 积分下单（接单时扣积分）
- 每日签到（+10 积分）
- 积分兑换奖励

### 管理员端

- 菜品管理（增删改查、上下架、活动价）
- 订单管理（接单、拒单、完成）
- 用户管理（查看、禁用、删除）
- 积分管理（手动调整、查看流水）
- 奖励管理（创建、审核兑换）
- 口令设置（实时生效，修改后旧 token 失效）

---

## 项目结构

```
.
├── 12/                      # uni-app 前端
│   ├── pages/               # 页面
│   │   ├── login/           # 登录页
│   │   ├── index/           # 首页（菜品列表）
│   │   ├── cart/            # 购物车
│   │   ├── order/           # 订单
│   │   ├── points/          # 积分中心
│   │   ├── profile/         # 个人中心
│   │   └── admin/           # 管理员页面
│   ├── components/          # 公共组件
│   ├── api/                 # 接口封装
│   ├── store/               # 状态管理
│   └── utils/               # 工具函数
├── server/                  # NestJS 后端
│   ├── src/
│   │   ├── entities/        # TypeORM 实体
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── dish/        # 菜品模块
│   │   │   ├── order/       # 订单模块
│   │   │   ├── user/        # 用户模块
│   │   │   └── exchange/    # 兑换模块
│   │   └── common/          # 公共（守卫/拦截器/过滤器）
│   └── database.sql         # 数据库初始化脚本
├── docs/                    # 文档
│   ├── screenshots/         # 截图
│   └── 业务流程.md          # 业务流程说明
├── DEVELOPMENT.md           # 开发指南
└── README.md                # 本文件
```

---

## 业务流程

### 订单状态流转

```
顾客下单 → 管理员接单 → 制作完成 → 顾客确认
  created    preparing     completed   confirmed
     │
     └── 任一阶段可取消 → cancelled
```

### 积分变动节点

| 操作 | 积分变动 | 说明 |
|------|----------|------|
| 管理员接单 | 顾客 -订单金额 | 积分暂存系统 |
| 订单完成 | 管理员 +订单金额 | 奖励给管理员 |
| 每日签到 | 顾客 +10 | 每天限 1 次 |
| 管理员充值 | 顾客 +/-N | 管理员手动调整 |
| 积分兑换 | 顾客 -奖励所需积分 | 兑换奖励 |

---

## API 接口

API 基础路径：`/v1`

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/account-login` | 账号密码登录（顾客需口令） |
| GET | `/auth/me` | 获取当前用户信息 |

### 菜品

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dishes` | 菜品列表 |
| GET | `/dishes/categories` | 分类列表 |

### 订单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/orders` | 创建订单 |
| GET | `/orders` | 我的订单列表 |
| POST | `/orders/:id/confirm` | 确认收货 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/orders` | 本组所有订单 |
| PUT | `/admin/orders/:id/status` | 修改订单状态 |
| GET | `/admin/users` | 本组顾客列表 |
| PUT | `/admin/users/:uid/points` | 调整积分 |
| POST | `/users/group-code` | 设置口令 |

更多接口详见 `docs/业务流程.md`

---

## 环境配置

### 前端环境切换

编辑 `12/utils/config.js`：

```javascript
const ENV = 'local'     // 本地开发 → localhost:3000
const ENV = 'tunnel'    // 内网穿透 → 填 TUNNEL_URL
const ENV = 'prod'      // 生产环境 → 填生产地址
```

### 后端环境配置

复制 `server/.env.example` 为 `server/.env`，修改数据库密码等配置。

---

## 开发备忘

### 内网穿透

使用 cpolar 分享给他人测试：

1. 注册 [cpolar](https://dashboard.cpolar.com/)
2. 命令行：`cpolar http 3000`
3. 拿到公网地址，改 `12/utils/config.js` 里的 `TUNNEL_URL`
4. 重新编译前端

### 数据库重置

```bash
mysql -u root -p weiyu < server/database.sql
```

---

## TODO

- [ ] 微信小程序登录（需企业资质）
- [ ] 文件存储上云（目前本地 `server/uploads/`）
- [ ] 单元测试
- [ ] 管理后台 UI 性能优化

---

## License

MIT
