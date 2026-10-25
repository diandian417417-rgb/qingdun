// ============================================================
// Mock 数据层
// 作用：后端接口尚未就绪时，用本地假数据驱动页面与交互，
// 让前端可以独立开发、演示审核/复核流程。
// 与 api/index.js 的 USE_MOCK 开关配合；后端就绪后切换开关即可。
// ============================================================

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// 简单模拟审核判定：实际由后端审核引擎（归一化 + 规则 + GLM）输出
function decideAudit(content) {
  const blockedWords = ['代考', '加微信', '赌博', '办证']
  const remindWords = ['加群', '私聊', '优惠']
  if (blockedWords.some((w) => content.includes(w))) {
    return { status: 'blocked', reason: '内容涉及交易引导，不予发表' }
  }
  if (remindWords.some((w) => content.includes(w))) {
    return { status: 'remind', reason: '内容疑似包含引导性信息，请修改后重新提交' }
  }
  // 其余部分随机：绝大多数通过，偶尔转人工复核以展示待复核流程
  const r = Math.random()
  if (r < 0.15) return { status: 'recheck', reason: '内容语义存疑，转人工复核' }
  return { status: 'passed', reason: '' }
}

let postSeq = 5
let commentSeq = 3

// 当前登录用户（模拟，实际来自登录接口）
let mockUser = { id: 1, username: 'gd_user', nickname: '青盾用户', role: 'student' }

const mockPosts = [
  {
    id: 1,
    title: '请问图书馆周五几点闭馆？',
    content: '如题，想晚上去自习，不知道具体时间，求解答。',
    author: '张三',
    authorId: 2,
    status: 'passed',
    auditReason: '',
    createdAt: '2026-10-21 18:20',
    likeCount: 12,
    commentCount: 3,
    image: '',
  },
  {
    id: 2,
    title: '食堂二楼新出的窗口测评',
    content: '上周开业的面馆味道不错，量也足，推荐大家去试试。',
    author: '李四',
    authorId: 3,
    status: 'passed',
    auditReason: '',
    createdAt: '2026-10-22 09:10',
    likeCount: 28,
    commentCount: 6,
    image: '',
  },
  {
    id: 3,
    title: '求推荐考研自习区',
    content: '最近图书馆太吵了，有没有安静一点的自习地方推荐？',
    author: '王五',
    authorId: 4,
    status: 'recheck',
    auditReason: '内容语义存疑，转人工复核',
    createdAt: '2026-10-22 20:05',
    likeCount: 5,
    commentCount: 0,
    image: '',
  },
  {
    id: 4,
    title: '周末操场有活动吗',
    content: '听说周末操场有社团招新，有人知道具体时间吗？',
    author: '张三',
    authorId: 2,
    status: 'pending',
    auditReason: '',
    createdAt: '2026-10-23 08:00',
    likeCount: 1,
    commentCount: 0,
    image: '',
  },
]

const mockComments = {
  1: [
    { id: 1, postId: 1, author: '李四', content: '我记得是九点，可以再确认下。', status: 'passed', createdAt: '2026-10-21 19:00' },
    { id: 2, postId: 1, author: '王五', content: '周五好像是八点半，记不太清。', status: 'passed', createdAt: '2026-10-21 20:12' },
  ],
  2: [{ id: 3, postId: 2, author: '赵六', content: '周末去试试，谢谢推荐！', status: 'passed', createdAt: '2026-10-22 10:02' }],
}

// 当前用户“我的内容”：帖子 + 评论 + 审核记录
const myPosts = [
  {
    id: 100,
    title: '青盾 内测帖子',
    content: '第一条测试帖子，看看审核流程怎么走。',
    author: '青盾用户',
    authorId: 1,
    status: 'passed',
    auditReason: '',
    createdAt: '2026-10-20 15:00',
    likeCount: 2,
    commentCount: 0,
    image: '',
  },
]

// 我的审核记录（个人中心用，只展示结论性原因，不下发词条/规则编号）
const myAuditRecords = [
  { id: 'A-1001', type: '帖子', title: '青盾 内测帖子', status: 'passed', reason: '通过', time: '2026-10-20 15:00' },
  { id: 'A-1002', type: '评论', title: '回复：食堂新窗口', status: 'blocked', reason: '涉及交易引导，不予发表', time: '2026-10-21 12:30' },
  { id: 'A-1003', type: '帖子', title: '关于校园卡使用的小问题', status: 'remind', reason: '疑似包含引导性信息，请修改后重新提交', time: '2026-10-22 10:15' },
]

// ===== 管理端 Mock =====
const mockDashboard = {
  stats: {
    auditCount: 1260,
    blockedCount: 87,
    recheckCount: 12,
    avgTimeE2E: 4.2,
    avgTimeRule: 0.6,
  },
  trend: [
    { date: '10-17', total: 170, blocked: 11 },
    { date: '10-18', total: 188, blocked: 13 },
    { date: '10-19', total: 165, blocked: 9 },
    { date: '10-20', total: 192, blocked: 15 },
    { date: '10-21', total: 175, blocked: 12 },
    { date: '10-22', total: 201, blocked: 14 },
    { date: '10-23', total: 169, blocked: 13 },
  ],
  layerDist: [
    { name: '规则层', value: 62 },
    { name: 'AI 语义层', value: 30 },
    { name: '人工复核', value: 8 },
  ],
  topTypes: [
    { name: '交易引导', count: 24 },
    { name: '低俗内容', count: 18 },
    { name: '人身攻击', count: 12 },
    { name: '广告引流', count: 9 },
    { name: '政治敏感', count: 5 },
  ],
}

const mockReviewQueue = [
  {
    id: 'R-001',
    content: '求拉进学习群，里面资源很多优惠力度大',
    author: '某某同学',
    submitAt: '2026-10-23 09:12',
    trigger: '语义置信度模糊',
    timeout: true,
  },
  {
    id: 'R-002',
    content: '有人知道哪里可以代办公交卡吗',
    author: '匿名',
    submitAt: '2026-10-23 10:30',
    trigger: '还原后仍存疑',
    timeout: false,
  },
  {
    id: 'R-003',
    content: '（一张含有文字的图片）图片文字 OCR 结果：加好友领福利',
    author: '张同学',
    submitAt: '2026-10-23 11:05',
    trigger: '图片内容存疑',
    timeout: false,
  },
]

const mockReviewDetail = {
  id: 'R-001',
  content: '求拉进学习群，里面资源很多优惠力度大',
  normalized: '求拉进学习群，里面资源很多优惠力度大',
  trigger: '语义置信度模糊',
  evidence: [
    { layer: '归一化层', result: '未检出可还原变体', time: '09:12:03' },
    { layer: '规则层', result: '未命中明确敏感词', time: '09:12:03' },
    { layer: 'AI 语义层', result: '置信度 62%，存在引流嫌疑，转人工复核', time: '09:12:05' },
  ],
  submitAt: '2026-10-23 09:12',
  author: '某某同学',
}

const mockRules = [
  { id: 1, word: '加V', category: '交易引导', level: '高', source: '人工添加', status: 'enabled', updatedAt: '2026-10-18' },
  { id: 2, word: '代考', category: '交易引导', level: '高', source: '人工添加', status: 'enabled', updatedAt: '2026-10-18' },
  { id: 3, word: 'zd（拆字）', category: '政治敏感', level: '高', source: '对抗样本', status: 'pending', updatedAt: '2026-10-22' },
  { id: 4, word: '优惠', category: '广告引流', level: '中', source: '申诉回流', status: 'pending', updatedAt: '2026-10-23' },
]

const mockAuditLogs = [
  { id: 1, time: '2026-10-23 09:12', content: '求拉进学习群…', layer: 'AI 语义层', rule: '置信度<70', result: '转人工', operator: 'system' },
  { id: 2, time: '2026-10-23 09:05', content: '代考过四级，加V详谈', layer: '规则层', rule: '代考', result: '拦截', operator: 'system' },
  { id: 3, time: '2026-10-22 21:00', content: '（图片）', layer: '图片审核', rule: 'OCR+语义', result: '拦截', operator: 'system' },
]

const mockUsers = [
  { id: 1, username: 'gd_user', posts: 3, violations: 1, level: '正常', risk: '低' },
  { id: 2, username: 'zhangsan', posts: 12, violations: 2, level: '提醒', risk: '中' },
  { id: 3, username: 'spammer01', posts: 40, violations: 8, level: '受限', risk: '高' },
]

const mockSystem = {
  services: [
    { name: '规则引擎', status: '正常' },
    { name: 'GLM 语义服务', status: '正常' },
    { name: 'OCR 服务', status: '正常' },
    { name: '行为规则引擎', status: '降级' },
  ],
  queueBacklog: 12,
  degradedMode: true,
}

const mockMessages = [
  { id: 1, type: '审核结果', title: '你的帖子《青盾 内测帖子》已通过审核', read: false, time: '2026-10-20 15:01' },
  { id: 2, type: '审核结果', title: '你的评论被拦截：涉及交易引导，不予发表', read: false, time: '2026-10-21 12:31' },
  { id: 3, type: '复核进度', title: '你的帖子《关于校园卡的小问题》复核中', read: true, time: '2026-10-22 10:16' },
]

// ===== Mock API（返回 Promise，模拟异步接口）=====
export const mock = {
  // ---- 认证（平台独立账号认证：用户名 + 密码）----
  async login({ username, password }) {
    await delay()
    if (!username || !password) throw new Error('账号或密码不能为空')
    // 模拟：任意非空账号均可登录；后端就绪后改为真实校验
    mockUser = { id: 1, username, nickname: username, role: 'student' }
    return mockUser
  },
  async register({ username, password }) {
    await delay()
    if (!username || !password) throw new Error('账号或密码不能为空')
    return { id: Date.now(), username, nickname: username, role: 'student' }
  },
  async adminLogin({ username, password }) {
    await delay()
    if (username !== 'admin' || password !== 'admin123') {
      throw new Error('账号或密码错误')
    }
    return { id: 1, username, nickname: '审核员', role: 'admin' }
  },

  // ---- 社区 ----
  async getPosts() {
    await delay()
    return mockPosts
  },
  async getPost(id) {
    await delay()
    return mockPosts.find((p) => p.id === Number(id)) || null
  },
  async getComments(postId) {
    await delay()
    return mockComments[postId] || []
  },
  async createPost(payload) {
    await delay()
    // 模拟审核：返回判定结果
    const result = decideAudit(payload.title + payload.content)
    const post = {
      id: ++postSeq,
      ...payload,
      author: mockUser.nickname,
      authorId: mockUser.id,
      status: result.status,
      auditReason: result.reason,
      createdAt: '2026-10-23 12:00',
      likeCount: 0,
      commentCount: 0,
    }
    mockPosts.unshift(post)
    if (post.status === 'passed') myPosts.unshift(post)
    return { post, audit: result }
  },
  async createComment({ postId, content }) {
    await delay()
    const result = decideAudit(content)
    const comment = { id: ++commentSeq, postId, author: mockUser.nickname, content, status: result.status, createdAt: '2026-10-23 12:00' }
    if (!mockComments[postId]) mockComments[postId] = []
    mockComments[postId].push(comment)
    return { comment, audit: result }
  },

  // ---- 我的内容 / 审核记录 / 消息 ----
  async getMyPosts() {
    await delay()
    return myPosts
  },
  async getMyAuditRecords() {
    await delay()
    return myAuditRecords
  },
  async getMessages() {
    await delay()
    return mockMessages
  },

  // ---- 管理端 ----
  async getDashboard() {
    await delay()
    return mockDashboard
  },
  async getReviewQueue() {
    await delay()
    return mockReviewQueue
  },
  async getReviewDetail(id) {
    await delay()
    return { ...mockReviewDetail, id }
  },
  async submitReview({ id, conclusion, reason }) {
    await delay()
    return { ok: true, id, conclusion, reason, time: '2026-10-23 12:00' }
  },
  async getRules() {
    await delay()
    return mockRules
  },
  async addRule(payload) {
    await delay()
    const rule = { id: Date.now(), ...payload, source: '人工添加', status: 'pending', updatedAt: '2026-10-23' }
    mockRules.unshift(rule)
    return rule
  },
  // 规则“待验证后启用”：回归通过后才能启用
  async verifyRule(id) {
    await delay()
    const rule = mockRules.find((r) => r.id === id)
    if (rule) rule.status = 'enabled'
    return rule
  },
  async getAuditLogs() {
    await delay()
    return mockAuditLogs
  },
  async getUsers() {
    await delay()
    return mockUsers
  },
  async getSystem() {
    await delay()
    return mockSystem
  },
}
