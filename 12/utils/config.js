// 味遇点餐系统 - 环境配置
// 改 ENV 的值即可切换环境，不用到处找地址

// local    = 本地开发 (localhost:3000)
// tunnel   = 内网穿透 (cpolar/ngrok 等)
// prod     = 生产环境
const ENV = 'local'

// 内网穿透地址 - 每次开新的 tunnel 改这里就行
const TUNNEL_URL = 'tcp://33.tcp.cpolar.top:14850'

const CONFIG = {
  local: {
    BASE_URL: 'http://localhost:3000/v1'
  },
  tunnel: {
    BASE_URL: TUNNEL_URL || 'http://localhost:3000/v1'
  },
  prod: {
    BASE_URL: ''  // 生产环境填实际地址
  }
}

if (ENV === 'tunnel' && !TUNNEL_URL) {
  console.warn('[config] tunnel 模式但 TUNNEL_URL 为空，已回退到 localhost')
}

export const BASE_URL = CONFIG[ENV].BASE_URL

// 订单状态映射
export const ORDER_STATUS_MAP = {
  created: { text: '待接单', color: '#8A7060' },
  preparing: { text: '制作中', color: '#FFD700' },
  completed: { text: '已完成', color: '#E8A87C' },
  confirmed: { text: '已确认', color: '#87CEEB' },
  cancelled: { text: '已取消', color: '#F08080' }
}

// 积分变动类型映射
export const FLOW_TYPE_MAP = {
  order_pay: { text: '订单支付', icon: 'minus', color: '#F08080' },
  order_refund: { text: '订单退款', icon: 'plus', color: '#E8A87C' },
  order_reward: { text: '订单收入', icon: 'plus', color: '#E8A87C' },
  admin_add: { text: '管理员充值', icon: 'plus', color: '#E8A87C' },
  admin_sub: { text: '管理员扣减', icon: 'minus', color: '#F08080' },
  exchange_sub: { text: '积分兑换', icon: 'minus', color: '#F08080' },
  sign_in: { text: '签到奖励', icon: 'plus', color: '#E8A87C' },
  activity_reward: { text: '活动奖励', icon: 'plus', color: '#E8A87C' }
}
