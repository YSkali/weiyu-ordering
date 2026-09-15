/**
 * 并发测试脚本 — 验证两个 bug 修复
 * 1. 订单完成重复奖励
 * 2. 兑换审核重复扣积分
 */

const BASE = 'http://localhost:3000/v1';

async function login(account, password, groupCode) {
  const res = await fetch(`${BASE}/auth/account-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account, password, groupCode }),
  });
  return res.json();
}

async function api(token, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ========== 测试 1：订单完成重复奖励 ==========
async function test1() {
  console.log('\n========== 测试 1：订单完成重复奖励 ==========');

  // 管理员登录
  const admin = await login('admin1', '123456');
  console.log(`管理员登录: ${admin.data?.nickname}, 初始积分: ${admin.data?.points}`);
  const adminPointsBefore = admin.data?.points;

  // 顾客登录（需要知道口令）
  // 先查管理员信息
  const adminProfile = await api(admin.data.token, 'GET', '/auth/me');
  console.log(`管理员信息:`, adminProfile.data?.nickname);

  // 尝试几个常见口令
  const groupCodes = ['test123', 'admin1', '123456'];
  let custToken = null;

  for (const gc of groupCodes) {
    const tryLogin = await login('testcustomer', '123456', gc);
    if (tryLogin.code === 0) {
      custToken = tryLogin.data.token;
      console.log(`顾客登录成功 (口令: ${gc})`);
      break;
    }
  }

  if (!custToken) {
    // 注册新顾客
    for (const gc of groupCodes) {
      const reg = await fetch(`${BASE}/auth/account-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'testcustomer', password: '123456', groupCode: gc }),
      });
      const regData = await reg.json();
      if (regData.code === 0) {
        custToken = regData.data.token;
        console.log(`注册顾客成功 (口令: ${gc})`);
        break;
      }
    }
  }

  if (!custToken) {
    console.log('❌ 测试 1 跳过：无法登录/注册顾客（需要管理员设置口令）');
    return;
  }
  if (!custToken) {
    console.log('❌ 测试 1 跳过：无法获取顾客 token');
    return;
  }

  // 获取顾客信息
  const custProfile = await api(custToken, 'GET', '/auth/me');
  const custUid = custProfile.data?.uid;
  console.log(`顾客: ${custProfile.data?.nickname}, uid=${custUid}, 积分: ${custProfile.data?.points}`);

  // 给顾客充值（确保足够）
  await api(admin.data.token, 'PUT', `/admin/users/${custUid}/points`, { change: 1000, remark: '测试充值' });

  // 创建订单（假设有菜品 id=1 和 id=2）
  const order = await api(custToken, 'POST', '/orders', {
    items: [{ dishId: 1, quantity: 1 }, { dishId: 2, quantity: 1 }],
    remark: '并发测试订单',
  });
  console.log(`创建订单: ${order.data?.orderId}, 积分: ${order.data?.totalPoints}`);

  if (order.code !== 0) {
    console.log('❌ 测试 1 跳过：创建订单失败', order.message);
    return;
  }

  const orderId = order.data.orderId;

  // 管理员接单
  const confirm = await api(admin.data.token, 'PUT', `/admin/orders/${orderId}/status`, { status: 'preparing' });
  console.log(`接单结果: ${confirm.message || confirm.code}`);

  // 获取订单项
  const orderDetail = await api(admin.data.token, 'GET', `/admin/orders/${orderId}`);
  const items = orderDetail.data?.items || [];
  console.log(`订单项数量: ${items.length}`);

  if (items.length < 2) {
    console.log('❌ 测试 1 跳过：订单项不足');
    return;
  }

  // 并发标记所有菜品完成
  console.log('并发标记菜品完成...');
  const promises = items.map(item =>
    api(admin.data.token, 'PUT', `/admin/orders/${orderId}/items/${item.itemId}/status`, { status: 'completed' })
  );

  const results = await Promise.allSettled(promises);
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`  菜品${i + 1}: code=${r.value.code}, ${r.value.message || ''}`);
    } else {
      console.log(`  菜品${i + 1}: 失败 - ${r.reason?.message}`);
    }
  });

  // 检查管理员积分变化
  const adminAfter = await api(admin.data.token, 'GET', '/auth/me');
  const adminPointsAfter = adminAfter.data?.points;
  const reward = adminPointsAfter - adminPointsBefore;

  console.log(`\n管理员积分变化: ${adminPointsBefore} → ${adminPointsAfter} (增加 ${reward})`);
  console.log(`订单积分: ${order.data?.totalPoints}`);

  if (reward === order.data?.totalPoints) {
    console.log('✅ 测试 1 通过：奖励只发放了一次');
  } else if (reward === 0) {
    console.log('⚠️ 测试 1 异常：管理员没拿到奖励（可能订单未自动完成）');
  } else {
    console.log(`❌ 测试 1 失败：奖励发放了 ${reward / order.data?.totalPoints} 次`);
  }
}

// ========== 测试 2：兑换审核重复扣积分 ==========
async function test2() {
  console.log('\n========== 测试 2：兑换审核重复扣积分 ==========');

  // 管理员登录
  const admin = await login('admin1', '123456');
  if (admin.code !== 0) {
    console.log('❌ 测试 2 跳过：管理员登录失败');
    return;
  }
  const adminToken = admin.data.token;

  // 顾客登录
  const customer = await login('testcustomer', '123456', 'test123');
  if (customer.code !== 0) {
    console.log('❌ 测试 2 跳过：顾客登录失败');
    return;
  }
  const custToken = customer.data.token;
  const custUid = customer.data.uid;

  // 确保顾客有足够积分
  await api(adminToken, 'PUT', `/admin/users/${custUid}/points`, { change: 1000, remark: '测试充值' });

  const custBefore = await api(custToken, 'GET', '/auth/me');
  const pointsBefore = custBefore.data?.points;
  console.log(`顾客初始积分: ${pointsBefore}`);

  // 顾客创建奖励（需要审核）
  const reward = await api(custToken, 'POST', '/exchange/rewards', {
    name: '测试奖励-' + Date.now(),
    description: '并发测试用',
    requiredPoints: 100,
    type: 'physical',
  });
  console.log(`创建奖励: id=${reward.data?.rewardId || reward.data?.id}`);

  if (reward.code !== 0) {
    console.log('❌ 测试 2 跳过：创建奖励失败', reward.message);
    return;
  }
  const rewardId = reward.data?.rewardId || reward.data?.id;

  // 管理员审核通过奖励
  const approveReward = await api(adminToken, 'POST', `/admin/exchange/rewards/${rewardId}/approve`);
  console.log(`审核奖励: ${approveReward.message}`);

  // 顾客创建兑换请求
  const request = await api(custToken, 'POST', '/exchange/requests', { rewardId });
  console.log(`创建兑换请求: id=${request.data?.requestId}`);
  if (request.code !== 0) {
    console.log('❌ 测试 2 跳过：创建请求失败', request.message);
    return;
  }
  const requestId = request.data.requestId;

  // 并发发送两个审核通过请求
  console.log('并发发送两个审核通过请求...');
  const [r1, r2] = await Promise.all([
    api(adminToken, 'PUT', `/admin/exchange/requests/${requestId}`, { status: 'approved' }),
    api(adminToken, 'PUT', `/admin/exchange/requests/${requestId}`, { status: 'approved' }),
  ]);

  console.log(`  请求1: code=${r1.code}, ${r1.message || ''}`);
  console.log(`  请求2: code=${r2.code}, ${r2.message || ''}`);

  // 检查顾客积分变化
  const custAfter = await api(custToken, 'GET', '/auth/me');
  const pointsAfter = custAfter.data?.points;
  const deducted = pointsBefore - pointsAfter;

  console.log(`\n顾客积分变化: ${pointsBefore} → ${pointsAfter} (扣除 ${deducted})`);
  console.log(`奖励所需积分: 100`);

  if (deducted === 100) {
    console.log('✅ 测试 2 通过：积分只扣除了一次');
  } else if (deducted === 0) {
    console.log('⚠️ 测试 2 异常：积分未扣除（可能审核未通过）');
  } else {
    console.log(`❌ 测试 2 失败：积分被扣了 ${deducted / 100} 次`);
  }
}

// ========== 运行 ==========
(async () => {
  try {
    await test1();
    await test2();
    console.log('\n========== 测试完成 ==========');
  } catch (err) {
    console.error('测试出错:', err);
  }
})();
