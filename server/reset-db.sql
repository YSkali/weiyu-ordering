USE weiyu;

-- 清除所有数据
DELETE FROM order_item;
DELETE FROM `order`;
DELETE FROM exchange_request;
DELETE FROM points_flow;
DELETE FROM comment;
DELETE FROM dish_visible_users;
DELETE FROM dish;
DELETE FROM category;
DELETE FROM exchange_reward;
DELETE FROM user;

-- 重置自增ID
ALTER TABLE user AUTO_INCREMENT = 1;
ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE dish AUTO_INCREMENT = 1;
ALTER TABLE exchange_reward AUTO_INCREMENT = 1;
ALTER TABLE exchange_request AUTO_INCREMENT = 1;
ALTER TABLE points_flow AUTO_INCREMENT = 1;
ALTER TABLE comment AUTO_INCREMENT = 1;
ALTER TABLE order_item AUTO_INCREMENT = 1;

-- 重新插入初始数据

-- 管理员账户 (openid = test_openid_admin, 对应 code=test_admin)
INSERT INTO `user` (`openid`, `role`, `nickname`, `avatar`, `points`, `version`, `status`) VALUES
('test_openid_admin', 'admin', '管理员', '', 0, 1, 1);

-- 测试顾客（5000积分）(openid = test_openid_customer, 对应 code=test_customer)
INSERT INTO `user` (`openid`, `role`, `nickname`, `avatar`, `points`, `version`, `status`) VALUES
('test_openid_customer', 'customer', '贪吃的小布布', '', 5000, 1, 1);

-- 分类
INSERT INTO `category` (`name`, `sort`) VALUES
('推荐', 0),
('甜点', 1),
('饮品', 2),
('主食', 3),
('小吃', 4);

-- 菜品
INSERT INTO `dish` (`name`, `price`, `activity_price`, `description`, `image_url`, `cate_id`) VALUES
('竹笋小蛋糕', 120, 100, '可爱造型的竹笋奶油小蛋糕，口感绵密', 'https://images.unsplash.com/photo-1557308536-ee471ef2c390?auto=format&fit=crop&q=80&w=400', 2),
('蜜桃乌龙茶', 80, NULL, '清香乌龙搭配蜜桃果肉，清爽解渴', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400', 3),
('森林蘑菇意面', 250, 220, '新鲜蘑菇配奶油酱汁，浓郁鲜香', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400', 4),
('松果饼干', 60, 50, '酥脆可口的松果造型饼干', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400', 5),
('浆果气泡水', 90, NULL, '混合浆果口味气泡水，清凉畅饮', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', 3),
('蜂蜜烤松饼', 110, 95, '外酥内软的蜂蜜黄油松饼', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 2);

-- 兑换奖励
INSERT INTO `exchange_reward` (`name`, `description`, `required_points`, `stock`, `type`) VALUES
('精美礼品盒', '包含小玩具和贴纸的精美礼品盒', 500, 20, 'physical'),
('双倍积分券', '下次下单积分翻倍', 200, -1, 'coupon'),
('免费饮品券', '可兑换任意一杯饮品', 150, 50, 'coupon'),
('VIP会员体验', '享受一周VIP特权', 1000, 10, 'service');

SELECT 'Database reset complete!' AS status;
