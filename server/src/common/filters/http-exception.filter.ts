import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        if (Array.isArray(message)) {
          message = message[0];
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 业务错误码映射
    let code: number = status;
    if (message.includes('积分不足')) code = 1001;
    else if (message.includes('库存不足')) code = 1002;
    else if (message.includes('活动已结束')) code = 1003;
    else if (message.includes('商品已下架')) code = 1004;
    else if (message.includes('订单已取消')) code = 1005;
    else if (message.includes('订单已完成')) code = 1006;
    else if (message.includes('用户不存在')) code = 2001;
    else if (message.includes('兑换请求不存在')) code = 2002;
    else if (message.includes('微信登录失败')) code = 3001;
    else if (message.includes('图片上传失败')) code = 3002;

    response.status(status).json({
      code,
      message,
      data: null,
      timestamp: Math.floor(Date.now() / 1000),
    });
  }
}
