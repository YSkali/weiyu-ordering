# 味遇积分点餐系统 — 项目文档

---

## 1. 项目简介

### 这是什么

「味遇」是一个积分制点餐系统，适合朋友之间、小圈子内部使用。

- 用**积分**代替金钱，没有支付风险
- 管理员自由控制积分发放，顾客用积分下单、兑换奖品
- 有签到、评论、活动价等玩法

### 谁能用

| 角色 | 登录方式 | 能做什么 |
|------|----------|----------|
| **管理员** | 内置账号（admin1~admin5）+ 密码 | 管理菜品、接单出餐、给用户充积分、审核兑换 |
| **顾客** | 账号 + 密码 + 口令（首次自动注册） | 浏览菜品、下单、签到赚积分、兑换奖品 |

### 积分怎么流动

```
来源：每日签到(+10) / 管理员充值 / 订单完成奖励
去向：下单点餐(接单时扣) / 兑换奖品(审核通过时扣) / 管理员扣减
```

每笔变动都有流水记录。

---

## 2. 技术架构

### 系统架构

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   用户浏览器   │────▶│  cpolar 隧道  │────▶│  后端服务     │
│  (H5 网页)    │     │  (内网穿透)   │     │  (NestJS)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────▼───────┐
                                          │    MySQL      │
                                          └───────────────┘
```

### 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | uni-app (Vue 3 Composition API) | 一套代码编译到微信小程序 + H5 |
| 后端 | NestJS 10.x (TypeScript) | 模块化架构，自带依赖注入、守卫、拦截器 |
| 数据库 | MySQL 8.0+ | 事务支持完善，适合订单/积分业务 |
| ORM | TypeORM 0.3.x | 实体装饰器定义（读操作用 raw SQL） |
| 认证 | JWT + bcrypt | 无状态认证，2小时过期 |
| 内网穿透 | cpolar | 开发阶段微信小程序联调 |

### 分组隔离机制

每个管理员拥有独立的 `groupCode`（分组口令），顾客注册时输入口令加入对应管理员的组。所有数据（订单、评论、用户列表）按组隔离。

---

## 3. 项目结构

```
一二布布点菜项目开发/
├── 12/                             # uni-app 前端
│   ├── App.vue                     # 根组件（全局样式、CSS变量）
│   ├── main.js                     # 入口文件
│   ├── manifest.json               # 应用配置（微信AppID、H5设置）
│   ├── pages.json                  # 路由配置（19个页面、4个TabBar）
│   ├── api/                        # API 模块（auth/dish/order/user/exchange/comment）
│   ├── store/                      # 状态管理（user/dish/cart，Vue 3 reactive）
│   ├── utils/                      # 工具函数（config/request/auth）
│   ├── components/                 # 公共组件
│   │   ├── DishCard.vue            # 菜品卡片（图片渐进加载、渐变价格）
│   │   ├── CartItemCard.vue        # 购物车卡片（数字弹跳动画）
│   │   ├── CategoryBar.vue         # 分类栏
│   │   ├── OrderCard.vue           # 订单卡片（状态色条、脉冲指示器）
│   │   ├── EmptyState.vue          # 空状态（装饰圆环、浮动点）
│   │   ├── SearchBar.vue           # 搜索栏（焦点光晕）
│   │   ├── AdminTabBar.vue         # 管理员底部导航（毛玻璃背景）
│   │   └── Skeleton.vue            # 骨架屏组件
│   ├── pages/                      # 页面（19个，见下方）
│   └── static/                     # 静态资源
├── server/                         # NestJS 后端
│   ├── src/
│   │   ├── main.ts                 # 入口（端口3000、静态文件、CORS）
│   │   ├── app.module.ts           # 根模块（synchronize: false）
│   │   ├── entities/               # 实体（10个）
│   │   ├── modules/                # 业务模块（auth/dish/order/user/exchange/comment）
│   │   └── common/                 # 公共设施（guards/decorators/interceptors/filters/dto）
│   ├── database.sql                # 数据库初始化脚本
│   └── .env                        # 环境变量
└── 项目文档/                        # 项目文档（4个文件）
    ├── weiyu-diancan-doc.md         # 技术实现文档（本文件）
    ├── 味遇项目开发流程指南.md        # 从零开发流程（含踩坑记录）
    ├── 使用手册.md                  # 日常运维操作手册
    └── 顾客使用指南.md              # 顾客操作指南
```

### 前端页面（19个）

| 页面 | 路径 | 角色 |
|------|------|------|
| 登录页 | login/login.vue | 公共 |
| 首页（菜品列表） | index/index.vue | 顾客 |
| 菜品详情 | dish/detail.vue | 顾客 |
| 购物车 | cart/index.vue | 顾客 |
| 订单列表 | order/list.vue | 顾客 |
| 订单详情 | order/detail.vue | 顾客 |
| 积分中心 | points/index.vue | 顾客 |
| 兑换商城 | exchange/index.vue | 顾客 |
| 我的奖励 | exchange/my-rewards.vue | 顾客 |
| 奖励编辑 | exchange/reward-edit.vue | 顾客 |
| 个人中心 | profile/index.vue | 顾客 |
| 菜品管理 | admin/home.vue | 管理员 |
| 菜品编辑 | admin/dish-edit.vue | 管理员 |
| 接单管理 | admin/accept.vue | 管理员 |
| 用户管理 | admin/users.vue | 管理员 |
| 积分奖励 | admin/rewards.vue | 管理员 |
| 兑换审核 | admin/exchange-review.vue | 管理员 |
| 积分流水 | admin/points-flow.vue | 管理员 |
| 管理员中心 | admin/mine.vue | 管理员 |

---

## 4. 数据库设计

### 表结构总览（10张表）

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `user` | 用户表 | uid, account, password, role, group_code, admin_uid, points, version |
| `category` | 分类表 | cate_id, name, sort |
| `dish` | 菜品表 | dish_id, name, price, activity_price, activity_start/end, cate_id, is_deleted |
| `dish_visible_users` | 菜品可见白名单 | dish_id, uid |
| `points_flow` | 积分流水 | flow_id, uid, change, type, relation_id |
| `comment` | 评论表 | comment_id, dish_id, uid, content, rating, parent_id |
| `exchange_reward` | 兑换奖励 | reward_id, name, required_points, stock, creator_uid |
| `exchange_request` | 兑换请求 | request_id, uid, reward_id, status |
| `order` | 订单表 | order_id (UUID), uid, status, total_points |
| `order_item` | 订单项 | item_id, order_id, dish_id, quantity, unit_price |

### 关键设计决策

1. **用户表统一存管理员和顾客**：用 `role` 字段区分（`admin` / `customer`）
2. **订单 ID 用 UUID**：不暴露业务量
3. **积分变动用乐观锁**：User 表加 `version` 字段，防止并发扣积分出错
4. **菜品软删除**：`isDeleted` 字段标记，不真删数据
5. **口令机制**：管理员有 `groupCode`，顾客注册时输入口令加入对应组

### 积分流水类型

| 类型 | 说明 |
|------|------|
| `order_pay` | 订单支付扣减 |
| `order_refund` | 订单退款返还 |
| `order_reward` | 订单完成奖励（管理员获得） |
| `admin_add` | 管理员增加 |
| `admin_sub` | 管理员扣减 |
| `exchange_sub` | 兑换扣减 |
| `sign_in` | 每日签到奖励（10积分） |

---

## 5. API 接口

所有接口前缀 `/v1`，统一响应格式：
```json
{ "code": 0, "message": "success", "data": {...}, "timestamp": 1234567890 }
```

### 认证模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | /auth/account-login | 公开 | 账号密码登录/注册 |
| GET | /auth/me | 登录 | 获取当前用户信息 |

### 菜品模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /dishes | 公开 | 菜品列表（分类筛选、关键词搜索、分页） |
| GET | /dishes/categories | 公开 | 分类列表 |
| GET | /dishes/:id | 公开 | 菜品详情 |
| POST | /admin/dishes | 管理员 | 创建菜品 |
| PUT | /admin/dishes/:id | 管理员 | 编辑菜品 |
| DELETE | /admin/dishes/:id | 管理员 | 下架（软删除） |
| PUT | /admin/dishes/:id/restore | 管理员 | 上架 |

### 订单模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | /orders | 顾客 | 创建订单 |
| GET | /orders | 登录 | 订单列表 |
| GET | /orders/:id | 登录 | 订单详情 |
| POST | /orders/:id/confirm | 顾客 | 确认收货 |
| GET | /admin/orders | 管理员 | 组内订单 |
| PUT | /admin/orders/:id/status | 管理员 | 更新订单状态 |
| PUT | /admin/orders/:id/items/:itemId/status | 管理员 | 更新菜品制作状态 |

### 用户模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | /users/sign-in | 登录 | 每日签到 |
| GET | /users/points/flow | 登录 | 积分流水 |
| PUT | /users/profile | 登录 | 修改昵称/头像 |
| PUT | /users/password | 登录 | 修改密码 |
| GET | /admin/users | 管理员 | 组内用户列表 |
| PUT | /admin/users/:uid/points | 管理员 | 调整积分 |
| DELETE | /admin/users/:uid | 管理员 | 删除用户 |
| PUT | /admin/users/:uid/ban | 管理员 | 禁用用户 |
| PUT | /admin/users/:uid/unban | 管理员 | 启用用户 |

### 兑换模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /exchange/rewards | 公开 | 奖励列表 |
| POST | /exchange/rewards | 顾客 | 创建奖励提案 |
| POST | /exchange/requests | 顾客 | 发起兑换请求 |
| POST | /admin/exchange/rewards/:id/approve | 管理员 | 通过奖励 |
| POST | /admin/exchange/rewards/:id/reject | 管理员 | 拒绝奖励 |
| POST | /admin/exchange/rewards/:id/claim | 管理员 | 兑换奖励 |
| PUT | /admin/exchange/requests/:id | 管理员 | 审核兑换请求 |

### 评论模块

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /dishes/:dishId/comments | 登录 | 评论列表（分组隔离） |
| POST | /comments | 登录 | 发表评论/回复 |
| POST | /admin/comments/:id/delete | 管理员 | 删除评论 |

---

## 6. 核心业务逻辑

### 订单状态流转

```
created（已下单，积分未扣）
  → preparing（管理员接单，积分已扣）
    → completed（所有菜品完成，管理员获得积分）
      → confirmed（顾客确认收货）

created → cancelled（取消）
```

### 积分扣减安全

使用数据库事务 + 悲观锁（`SELECT ... FOR UPDATE`）确保积分操作安全。

### 活动价格

菜品可设置活动价 + 活动时间段。活动期间内顾客端显示活动价（原价划线），下单时按活动价计算。

---

## 7. 前端设计规范

### CSS 变量系统

在 `App.vue` 中定义全局设计令牌：

```css
--color-primary: #D4845A        /* 主色调 */
--color-primary-light: #E8A87C  /* 主色调浅 */
--color-text-primary: #4A3328   /* 主文字 */
--color-text-secondary: #5C4033 /* 副文字 */
--color-bg: #FFFAF5             /* 背景色 */
--color-surface: #FFFFFF        /* 卡片色 */
--gradient-primary: linear-gradient(135deg, #D4845A, #E8A87C)
--shadow-card: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08)
--radius-sm/md/lg/full: 16rpx/24rpx/32rpx/999rpx
```

### 动画系统

| 效果 | 说明 |
|------|------|
| 页面入场 | fadeIn + translateY |
| 卡片弹入 | cardPop (scale + translateY) |
| 列表交错 | stagger animation-delay |
| 按钮涟漪 | ::after 伪元素 + :active |
| 图片渐进 | shimmer 占位 + opacity 淡入 |
| 骨架屏 | shimmer 背景动画 |
| 毛玻璃 | backdrop-filter: blur(20px) |
| 渐变文字 | background-clip: text |

### 关键配置文件

| 文件 | 说明 |
|------|------|
| `server/.env` | 数据库连接、JWT密钥、端口 |
| `server/src/app.module.ts` | TypeORM 配置（synchronize: false） |
| `12/utils/config.js` | 前端 API 地址（cpolar 公网地址） |
| `12/pages.json` | 路由配置、TabBar、页面过渡动画 |

---

## 8. 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin1 ~ admin5 | 123456 | 管理员 |

顾客端首次登录自动注册，需要输入管理员提供的口令。
