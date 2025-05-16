const express = require('express');
const path = require('path');
const fs = require('fs');
const decode = require('safe-decode-uri-component');

// 从src-tauri/server.js复制的函数
/**
 *  描述：动态获取模块定义
 * @param {string}  modulesPath  模块路径(TS)
 * @param {Record<string, string>} specificRoute  特定模块定义
 * @param {boolean} doRequire  如果为 true，则使用 require 加载模块, 否则打印模块路径， 默认为true
 * @return { Promise<ModuleDefinition[]> }
 * @example getModuleDefinitions("./module", {"album_new.js": "/album/create"})
 */
async function getModulesDefinitions(modulesPath, specificRoute, doRequire = true) {
  const files = await fs.promises.readdir(modulesPath);
  const parseRoute = (fileName) =>
    specificRoute && fileName in specificRoute ? specificRoute[fileName] : `/${fileName.replace(/\.(js)$/i, '').replace(/_/g, '/')}`;

  return files
    .reverse()
    .filter((fileName) => fileName.endsWith('.js') && !fileName.startsWith('_'))
    .map((fileName) => {
      const identifier = fileName.split('.').shift();
      const route = parseRoute(fileName);
      const modulePath = path.resolve(modulesPath, fileName);
      const module = doRequire ? require(modulePath) : modulePath;
      return { identifier, route, module };
    });
}

/**
 * 创建服务
 * @param {ModuleDefinition[]} moduleDefs
 * @return {Promise<import('express').Express>}
 */
async function consturctServer(moduleDefs) {
  const app = express();
  const { CORS_ALLOW_ORIGIN } = process.env;
  app.set('trust proxy', true);

  /**
   * CORS & Preflight request
   */
  app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
      res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN || req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8',
      });
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next();
  });

  // 添加body-parser中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie Parser
  app.use((req, _, next) => {
    req.cookies = {};
    (req.headers.cookie || '').split(/;\s+|(?<!\s)\s+$/g).forEach((pair) => {
      const crack = pair.indexOf('=');
      if (crack < 1 || crack === pair.length - 1) {
        return;
      }
      req.cookies[decode(pair.slice(0, crack)).trim()] = decode(pair.slice(crack + 1)).trim();
    });
    next();
  });

  // 添加基本路由
  app.get('/', (req, res) => {
    res.json({ message: 'API服务器运行中' });
  });

  // 启用模块路由
  const { cookieToJson } = require('./api/util/util');
  const { createRequest } = require('./api/util/request');
  
  for (const moduleDef of moduleDefs) {
    app.use(moduleDef.route, async (req, res) => {
      console.log('\n---------------------------------------------');
      console.log(`[请求] ${req.method} ${req.originalUrl}`);
      console.log('[请求参数]', { query: req.query, body: req.body });
      
      [req.query, req.body].forEach((item) => {
        if (item && typeof item.cookie === 'string') {
          item.cookie = cookieToJson(decode(item.cookie));
        }
      });

      const query = Object.assign({}, { cookie: req.cookies }, req.query, { body: req.body });

      try {
        const moduleResponse = await moduleDef.module(query, (config) => {
          let ip = req.ip;
          if (ip.substring(0, 7) === '::ffff:') {
            ip = ip.substring(7);
          }
          config.ip = ip;
          return createRequest(config);
        });

        console.log('[响应状态]', moduleResponse.status);
        console.log('[响应数据]', typeof moduleResponse.body === 'string' 
          ? (moduleResponse.body.length > 500 ? moduleResponse.body.substring(0, 500) + '...' : moduleResponse.body)
          : moduleResponse.body);
        console.log('[OK]', decode(req.originalUrl));
        console.log('---------------------------------------------\n');

        const cookies = moduleResponse.cookie;
        if (!query.noCookie) {
          if (Array.isArray(cookies) && cookies.length > 0) {
            if (req.protocol === 'https') {
              res.append(
                'Set-Cookie',
                cookies.map((cookie) => {
                  return `${cookie}; PATH=/; SameSite=None; Secure`;
                })
              );
            } else {
              res.append(
                'Set-Cookie',
                cookies.map((cookie) => {
                  return `${cookie}; PATH=/`;
                })
              );
            }
          }
        }

        res.header(moduleResponse.headers).status(moduleResponse.status).send(moduleResponse.body);
      } catch (e) {
        const moduleResponse = e;
        console.log('[ERR]', decode(req.originalUrl), {
          status: moduleResponse.status,
          body: moduleResponse.body,
        });

        if (!moduleResponse.body) {
          res.status(404).send({
            code: 404,
            data: null,
            msg: 'Not Found',
          });
          return;
        }

        res.header(moduleResponse.headers).status(moduleResponse.status).send(moduleResponse.body);
      }
    });
  }

  return app;
}

// 启动API服务器
async function startServer() {
  try {
    // 获取模块定义
    const modulesPath = path.join(__dirname, 'api/module');
    if (!fs.existsSync(modulesPath)) {
      console.error('API模块目录不存在:', modulesPath);
      process.exit(1);
    }
    
    console.log('加载API模块目录:', modulesPath);
    const moduleDefs = await getModulesDefinitions(modulesPath, {});
    console.log(`成功加载 ${moduleDefs.length} 个API模块`);
    
    // 构建服务器
    const app = await consturctServer(moduleDefs);
    
    // 监听端口
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`外部API服务器已启动: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动外部API服务器失败:', error);
  }
}

startServer(); 