-- 味遇积分点餐系统 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS weiyu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE weiyu;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `uid` INT PRIMARY KEY AUTO_INCREMENT,
  `openid` VARCHAR(64) UNIQUE NOT NULL COMMENT '微信唯一标识',
  `role` VARCHAR(16) NOT NULL DEFAULT 'customer' COMMENT '角色：admin/customer',
  `nickname` VARCHAR(64) NOT NULL DEFAULT '用户' COMMENT '用户昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `points` INT NOT NULL DEFAULT 0 COMMENT '积分余额',
  `version` INT NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常 0禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `account` VARCHAR(64) DEFAULT NULL UNIQUE COMMENT '登录账号',
  `password` VARCHAR(255) DEFAULT NULL COMMENT '登录密码(bcrypt加密)',
  `group_code` VARCHAR(64) DEFAULT NULL COMMENT '管理员分组口令',
  `admin_uid` INT DEFAULT NULL COMMENT '顾客所属管理员UID',
  `last_nickname_change_at` DATETIME DEFAULT NULL COMMENT '上次修改昵称时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  INDEX `idx_user_openid` (`openid`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_status` (`status`),
  INDEX `idx_user_admin_uid` (`admin_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 分类表
CREATE TABLE IF NOT EXISTS `category` (
  `cate_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL COMMENT '分类名称',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 3. 菜品表
CREATE TABLE IF NOT EXISTS `dish` (
  `dish_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '菜品名称',
  `price` INT NOT NULL COMMENT '原积分价格',
  `activity_price` INT DEFAULT NULL COMMENT '活动积分价',
  `activity_start` DATETIME DEFAULT NULL COMMENT '活动开始时间',
  `activity_end` DATETIME DEFAULT NULL COMMENT '活动结束时间',
  `description` TEXT COMMENT '菜品描述',
  `image_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '图片URL',
  `cate_id` INT NOT NULL COMMENT '分类ID',
  `visibility` TINYINT NOT NULL DEFAULT 0 COMMENT '可见性：0公开 1指定用户',
  `comment_enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '评论开关：1开启 0关闭',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除标记：0正常 1已删除',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dish_cate_id` (`cate_id`),
  INDEX `idx_dish_is_deleted` (`is_deleted`),
  INDEX `idx_dish_visibility` (`visibility`),
  INDEX `idx_dish_cate_deleted` (`cate_id`, `is_deleted`),
  FOREIGN KEY (`cate_id`) REFERENCES `category`(`cate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜品表';

-- 4. 菜品可见白名单
CREATE TABLE IF NOT EXISTS `dish_visible_users` (
  `dish_id` INT NOT NULL,
  `uid` INT NOT NULL,
  PRIMARY KEY (`dish_id`, `uid`),
  INDEX `idx_dish_visible_users_uid` (`uid`),
  FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`),
  FOREIGN KEY (`uid`) REFERENCES `user`(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜品可见白名单';

-- 5. 积分流水表
CREATE TABLE IF NOT EXISTS `points_flow` (
  `flow_id` INT PRIMARY KEY AUTO_INCREMENT,
  `uid` INT NOT NULL COMMENT '用户ID',
  `change` INT NOT NULL COMMENT '变动值（正负）',
  `type` VARCHAR(32) NOT NULL COMMENT '变动类型：order_pay/order_refund/admin_add/admin_sub/exchange_sub/sign_in/activity_reward',
  `relation_id` VARCHAR(64) DEFAULT NULL COMMENT '关联ID（订单/兑换请求）',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_points_flow_uid` (`uid`),
  INDEX `idx_points_flow_type` (`type`),
  INDEX `idx_points_flow_created_at` (`created_at`),
  INDEX `idx_points_flow_uid_created_at` (`uid`, `created_at`),
  FOREIGN KEY (`uid`) REFERENCES `user`(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分流水表';

-- 6. 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `comment_id` INT PRIMARY KEY AUTO_INCREMENT,
  `dish_id` INT NOT NULL COMMENT '菜品ID',
  `uid` INT NOT NULL COMMENT '用户ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `rating` TINYINT NOT NULL DEFAULT 5 COMMENT '评分（1-5）',
  `parent_id` INT DEFAULT NULL COMMENT '回复的评论ID',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1显示 0隐藏',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comment_dish_id` (`dish_id`),
  INDEX `idx_comment_uid` (`uid`),
  INDEX `idx_comment_status` (`status`),
  FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`),
  FOREIGN KEY (`uid`) REFERENCES `user`(`uid`),
  FOREIGN KEY (`parent_id`) REFERENCES `comment`(`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 7. 积分兑换奖励表
CREATE TABLE IF NOT EXISTS `exchange_reward` (
  `reward_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '奖励名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '奖励描述',
  `required_points` INT NOT NULL COMMENT '所需积分',
  `stock` INT NOT NULL DEFAULT -1 COMMENT '库存（-1表示无限）',
  `type` VARCHAR(16) NOT NULL DEFAULT 'physical' COMMENT '奖品类型：physical/coupon/points/service',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '奖品图片',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `creator_uid` INT DEFAULT NULL COMMENT '创建者UID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_exchange_reward_creator_uid` (`creator_uid`),
  INDEX `idx_exchange_reward_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分兑换奖励表';

-- 8. 兑换申请表
CREATE TABLE IF NOT EXISTS `exchange_request` (
  `request_id` INT PRIMARY KEY AUTO_INCREMENT,
  `uid` INT NOT NULL COMMENT '用户ID',
  `reward_id` INT NOT NULL COMMENT '奖励ID',
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending' COMMENT '状态：pending/approved/rejected/completed',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_exchange_request_uid` (`uid`),
  INDEX `idx_exchange_request_status` (`status`),
  FOREIGN KEY (`uid`) REFERENCES `user`(`uid`),
  FOREIGN KEY (`reward_id`) REFERENCES `exchange_reward`(`reward_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换申请表';

-- 9. 订单表
CREATE TABLE IF NOT EXISTS `order` (
  `order_id` VARCHAR(32) PRIMARY KEY COMMENT '订单号（UUID）',
  `uid` INT NOT NULL COMMENT '用户ID',
  `status` VARCHAR(16) NOT NULL DEFAULT 'created' COMMENT '订单状态：created/paid/preparing/completed/confirmed/cancelled',
  `total_points` INT NOT NULL COMMENT '总积分',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '订单备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_uid` (`uid`),
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_created_at` (`created_at`),
  FOREIGN KEY (`uid`) REFERENCES `user`(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 10. 订单项表
CREATE TABLE IF NOT EXISTS `order_item` (
  `item_id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` VARCHAR(32) NOT NULL COMMENT '订单号',
  `dish_id` INT NOT NULL COMMENT '菜品ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `unit_price` INT NOT NULL COMMENT '单价（积分）',
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending' COMMENT '制作状态：pending/preparing/completed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_item_dish_id` (`dish_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`),
  FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单项表';

-- ========================================
-- 初始化种子数据
-- ========================================

-- 初始化旧版管理员账户（保留兼容，同时设置账号密码）
INSERT INTO `user` (`openid`, `role`, `nickname`, `points`, `account`, `password`)
VALUES ('admin_openid', 'admin', '管理员', 0, 'admin1', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6')
ON DUPLICATE KEY UPDATE `nickname` = VALUES(`nickname`), `account` = VALUES(`account`), `password` = VALUES(`password`);

-- 初始化测试顾客（保留兼容）
INSERT INTO `user` (`openid`, `role`, `nickname`, `points`)
VALUES ('test_customer_openid', 'customer', '贪吃的小布布', 5000)
ON DUPLICATE KEY UPDATE `nickname` = VALUES(`nickname`);

-- 初始化 5 个内置管理员账户
-- 默认密码已通过 bcrypt 加密，部署后请在后台修改
INSERT INTO `user` (`openid`, `account`, `password`, `role`, `nickname`, `points`) VALUES
('admin_account_01', 'admin1', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6', 'admin', '管理员1', 1000),
('admin_account_02', 'admin2', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6', 'admin', '管理员2', 1000),
('admin_account_03', 'admin3', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6', 'admin', '管理员3', 1000),
('admin_account_04', 'admin4', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6', 'admin', '管理员4', 1000),
('admin_account_05', 'admin5', '$2b$10$VBo.UDaCq2Bpzs8aXHWK9O2yaeCkER8Bxx8cFS8uC6DhxJt19MBs6', 'admin', '管理员5', 1000)
ON DUPLICATE KEY UPDATE `nickname` = VALUES(`nickname`);

-- 初始化分类
INSERT INTO `category` (`name`, `sort`) VALUES
('推荐', 0),
('甜点', 1),
('饮品', 2),
('主食', 3),
('小吃', 4);

-- 初始化菜品
INSERT INTO `dish` (`name`, `price`, `activity_price`, `description`, `image_url`, `cate_id`) VALUES
('竹笋小蛋糕', 120, 100, '可爱造型的竹笋奶油小蛋糕，口感绵密', 'https://images.unsplash.com/photo-1557308536-ee471ef2c390?auto=format&fit=crop&q=80&w=400', 2),
('蜜桃乌龙茶', 80, NULL, '清香乌龙搭配蜜桃果肉，清爽解渴', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400', 3),
('森林蘑菇意面', 250, 220, '新鲜蘑菇配奶油酱汁，浓郁鲜香', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400', 4),
('松果饼干', 60, 50, '酥脆可口的松果造型饼干', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400', 5),
('浆果气泡水', 90, NULL, '混合浆果口味气泡水，清凉畅饮', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', 3),
('蜂蜜烤松饼', 110, 95, '外酥内软的蜂蜜黄油松饼', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 2);

-- 初始化兑换奖励
INSERT INTO `exchange_reward` (`name`, `description`, `required_points`, `stock`, `type`) VALUES
('精美礼品盒', '包含小玩具和贴纸的精美礼品盒', 500, 20, 'physical'),
('双倍积分券', '下次下单积分翻倍', 200, -1, 'coupon'),
('免费饮品券', '可兑换任意一杯饮品', 150, 50, 'coupon'),
('VIP会员体验', '享受一周VIP特权', 1000, 10, 'service');
