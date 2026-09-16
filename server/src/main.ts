import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 兼容 nest start --watch（dist/src/）和 nest start（dist/）两种情况
  const projectRoot = existsSync(join(__dirname, '..', 'public'))
    ? join(__dirname, '..')
    : join(__dirname, '..', '..');

  // 动态注入 API 基础地址到 index.html（必须在静态文件中间件之前）
  const indexHtmlPath = join(projectRoot, 'public', 'index.html');
  const originalHtml = readFileSync(indexHtmlPath, 'utf8');

  app.use((req, res, next) => {
    // 匹配 / 或 /index.html，支持 token 参数注入
    const urlPath = req.url || '';
    const isRoot = urlPath === '/' || urlPath.startsWith('/?') || urlPath === '/index.html';
    if (isRoot) {
      const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
      let html = originalHtml.replace(
        '__API_BASE_URL__',
        `${origin}/v1`
      );
      // 支持通过 URL 参数注入 token，用于截图等自动化场景
      const tokenMatch = urlPath.match(/token=([^&]+)/);
      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        // 保留 hash 路由，避免重定向后丢失页面路径
        const injectScript = `<script>localStorage.setItem('token','${token}');var h=location.hash||'/';if(!h.includes('?'))location.replace(h);else location.replace('/');</script>`;
        html = html.replace('</head>', injectScript + '</head>');
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
    next();
  });

  // 静态文件服务 - 头像等上传文件
  app.useStaticAssets(join(projectRoot, 'uploads'), { prefix: '/uploads' });

  // 静态文件服务 - H5 前端
  app.useStaticAssets(join(projectRoot, 'public'));

  // 兼容旧版前端：把没有 /v1 前缀的 API 请求转发到 /v1
  app.use((req, res, next) => {
    const apiPaths = ['/auth/', '/dishes', '/orders', '/users', '/exchange', '/admin/', '/uploads/'];
    if (apiPaths.some(p => req.url.startsWith(p)) && !req.url.startsWith('/v1/')) {
      req.url = '/v1' + req.url;
    }
    next();
  });

  // 全局前缀
  app.setGlobalPrefix('v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`味遇点餐系统后端服务已启动: http://localhost:${port}`);
}
bootstrap();
