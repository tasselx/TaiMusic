// 简单的状态检查端点
module.exports = async (query, request) => {
  return {
    status: 200,
    body: {
      code: 200,
      status: 'ok',
      message: '酷狗API服务正常运行中',
      timestamp: new Date().toISOString()
    },
    cookie: [],
    headers: {
      'content-type': 'application/json',
    }
  };
}; 