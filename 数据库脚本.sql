-- 订户订阅报刊管理系统 - MySQL数据库脚本
-- 数据库课程设计项目

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS newspaper_subscription;
USE newspaper_subscription;

-- 2. 创建订户表
CREATE TABLE subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. 创建报刊表
CREATE TABLE newspapers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. 创建订阅关系表
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscriber_id INT NOT NULL,
    newspaper_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE,
    FOREIGN KEY (newspaper_id) REFERENCES newspapers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subscription (subscriber_id, newspaper_id, start_date)
);

-- 5. 插入示例数据

-- 插入示例订户
INSERT INTO subscribers (name, email, phone, address) VALUES
('张三', 'zhangsan@example.com', '13800138000', '北京市海淀区'),
('李四', 'lisi@example.com', '13900139000', '上海市浦东新区'),
('王五', 'wangwu@example.com', '13700137000', '广州市天河区'),
('赵六', 'zhaoliu@example.com', '13600136000', '深圳市南山区'),
('钱七', 'qianqi@example.com', '13500135000', '杭州市西湖区');

-- 插入示例报刊
INSERT INTO newspapers (name, publisher, frequency, price, description) VALUES
('人民日报', '人民日报社', '日刊', 2.50, '中国共产党中央委员会机关报'),
('南方周末', '南方报业传媒集团', '周刊', 5.00, '中国深具公信力的严肃大报'),
('读者', '读者出版传媒股份有限公司', '月刊', 8.00, '综合性文摘杂志'),
('中国青年报', '中国青年报社', '日刊', 3.00, '面向全国青年的综合性报纸'),
('科技日报', '科技日报社', '日刊', 2.00, '报道科技新闻的专业报纸'),
('财经杂志', '财经杂志社', '月刊', 15.00, '专注于财经领域的深度报道');

-- 插入示例订阅
INSERT INTO subscriptions (subscriber_id, newspaper_id, start_date, end_date, status) VALUES
(1, 1, '2025-01-01', '2025-12-31', 'active'),
(1, 2, '2025-01-01', '2025-06-30', 'active'),
(2, 1, '2025-02-01', '2025-08-31', 'active'),
(3, 3, '2025-03-01', '2025-09-30', 'active'),
(4, 4, '2025-01-15', '2025-07-15', 'active'),
(5, 5, '2025-02-15', '2025-08-15', 'active'),
(2, 6, '2025-03-01', '2025-12-31', 'active'),
(3, 1, '2025-04-01', '2025-10-31', 'expired'),
(4, 2, '2024-11-01', '2025-05-01', 'cancelled');

-- 6. 创建索引以提高查询性能
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_newspapers_name ON newspapers(name);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 7. 创建视图以便于查询

-- 查看活跃订阅的详细信息
CREATE VIEW active_subscriptions_view AS
SELECT 
    s.id AS subscription_id,
    sub.name AS subscriber_name,
    sub.email AS subscriber_email,
    n.name AS newspaper_name,
    n.publisher,
    n.price,
    s.start_date,
    s.end_date,
    s.status,
    DATEDIFF(s.end_date, CURDATE()) AS days_remaining
FROM subscriptions s
JOIN subscribers sub ON s.subscriber_id = sub.id
JOIN newspapers n ON s.newspaper_id = n.id
WHERE s.status = 'active'
ORDER BY s.start_date DESC;

-- 查看每个订户的订阅统计
CREATE VIEW subscriber_stats_view AS
SELECT 
    sub.id AS subscriber_id,
    sub.name AS subscriber_name,
    COUNT(s.id) AS total_subscriptions,
    SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) AS active_subscriptions,
    SUM(CASE WHEN s.status = 'expired' THEN 1 ELSE 0 END) AS expired_subscriptions,
    SUM(CASE WHEN s.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_subscriptions,
    SUM(n.price) AS total_spent
FROM subscribers sub
LEFT JOIN subscriptions s ON sub.id = s.subscriber_id
LEFT JOIN newspapers n ON s.newspaper_id = n.id
GROUP BY sub.id, sub.name
ORDER BY total_subscriptions DESC;

-- 查看每个报刊的订阅统计
CREATE VIEW newspaper_stats_view AS
SELECT 
    n.id AS newspaper_id,
    n.name AS newspaper_name,
    n.publisher,
    n.frequency,
    n.price,
    COUNT(s.id) AS total_subscriptions,
    SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) AS active_subscriptions,
    MIN(s.start_date) AS earliest_subscription,
    MAX(s.end_date) AS latest_subscription
FROM newspapers n
LEFT JOIN subscriptions s ON n.id = s.newspaper_id
GROUP BY n.id, n.name, n.publisher, n.frequency, n.price
ORDER BY total_subscriptions DESC;

-- 8. 创建存储过程

-- 存储过程：添加新订户
DELIMITER //
CREATE PROCEDURE AddSubscriber(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_address VARCHAR(200)
)
BEGIN
    INSERT INTO subscribers (name, email, phone, address)
    VALUES (p_name, p_email, p_phone, p_address);
    
    SELECT LAST_INSERT_ID() AS new_subscriber_id;
END //
DELIMITER ;

-- 存储过程：添加新报刊
DELIMITER //
CREATE PROCEDURE AddNewspaper(
    IN p_name VARCHAR(100),
    IN p_publisher VARCHAR(100),
    IN p_frequency VARCHAR(20),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT
)
BEGIN
    INSERT INTO newspapers (name, publisher, frequency, price, description)
    VALUES (p_name, p_publisher, p_frequency, p_price, p_description);
    
    SELECT LAST_INSERT_ID() AS new_newspaper_id;
END //
DELIMITER ;

-- 存储过程：添加新订阅
DELIMITER //
CREATE PROCEDURE AddSubscription(
    IN p_subscriber_id INT,
    IN p_newspaper_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_status VARCHAR(20)
)
BEGIN
    INSERT INTO subscriptions (subscriber_id, newspaper_id, start_date, end_date, status)
    VALUES (p_subscriber_id, p_newspaper_id, p_start_date, p_end_date, p_status);
    
    SELECT LAST_INSERT_ID() AS new_subscription_id;
END //
DELIMITER ;

-- 存储过程：更新订阅状态
DELIMITER //
CREATE PROCEDURE UpdateSubscriptionStatus(
    IN p_subscription_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    UPDATE subscriptions 
    SET status = p_new_status, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_subscription_id;
    
    SELECT ROW_COUNT() AS rows_updated;
END //
DELIMITER ;

-- 9. 创建触发器

-- 触发器：检查订阅结束日期是否晚于开始日期
DELIMITER //
CREATE TRIGGER check_subscription_dates
BEFORE INSERT ON subscriptions
FOR EACH ROW
BEGIN
    IF NEW.end_date <= NEW.start_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '结束日期必须晚于开始日期';
    END IF;
END //
DELIMITER ;

-- 触发器：自动更新订阅状态为过期
DELIMITER //
CREATE TRIGGER update_expired_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND NEW.status = 'active' THEN
        SET NEW.status = 'expired';
    END IF;
END //
DELIMITER ;

-- 10. 查询示例

-- 查询所有活跃订阅
SELECT * FROM active_subscriptions_view;

-- 查询即将过期的订阅（30天内）
SELECT 
    subscription_id,
    subscriber_name,
    newspaper_name,
    start_date,
    end_date,
    days_remaining
FROM active_subscriptions_view
WHERE days_remaining BETWEEN 1 AND 30
ORDER BY days_remaining ASC;

-- 查询最受欢迎的报刊
SELECT * FROM newspaper_stats_view;

-- 查询消费最高的订户
SELECT * FROM subscriber_stats_view
ORDER BY total_spent DESC;

-- 11. 数据库维护语句

-- 备份数据库（在命令行中执行）
-- mysqldump -u root -p newspaper_subscription > newspaper_subscription_backup.sql

-- 恢复数据库（在命令行中执行）
-- mysql -u root -p newspaper_subscription < newspaper_subscription_backup.sql

-- 12. 权限设置（根据实际需要调整）
-- GRANT SELECT, INSERT, UPDATE, DELETE ON newspaper_subscription.* TO 'app_user'@'localhost' IDENTIFIED BY 'password';
-- GRANT EXECUTE ON PROCEDURE newspaper_subscription.* TO 'app_user'@'localhost';

-- 13. 注释说明
/*
数据库设计说明：
1. 使用InnoDB引擎（默认），支持事务和外键
2. 使用UTF8字符集，支持中文
3. 使用自动递增主键
4. 使用时间戳记录创建和更新时间
5. 使用外键约束保证数据完整性
6. 使用唯一约束防止重复数据
7. 使用索引提高查询性能
8. 使用视图简化复杂查询
9. 使用存储过程封装业务逻辑
10. 使用触发器实现业务规则

表关系说明：
1. 一个订户可以订阅多个报刊
2. 一个报刊可以被多个订户订阅
3. 订阅表记录订户和报刊的多对多关系
4. 使用级联删除保证数据一致性
*/

-- 脚本结束
