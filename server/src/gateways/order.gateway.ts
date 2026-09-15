import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`);
  }

  @SubscribeMessage('join:admin')
  handleJoinAdmin(client: Socket) {
    client.join('admin');
    this.logger.log(`管理员加入: ${client.id}`);
  }

  @SubscribeMessage('join:user')
  handleJoinUser(client: Socket, uid: number) {
    client.join(`user:${uid}`);
    this.logger.log(`用户 ${uid} 加入: ${client.id}`);
  }

  // 通知管理员新订单
  emitOrderCreated(data: any) {
    this.server.to('admin').emit('order:created', data);
  }

  // 通知用户订单状态变更
  emitOrderStatus(uid: number, data: any) {
    this.server.to(`user:${uid}`).emit('order:status', data);
  }

  // 通知订单项状态变更
  emitOrderItemStatus(uid: number, data: any) {
    this.server.to(`user:${uid}`).emit('order:item_status', data);
  }

  // 通知管理员新兑换申请
  emitExchangeRequest(data: any) {
    this.server.to('admin').emit('exchange:request', data);
  }

  // 通知用户兑换审核结果
  emitExchangeApproved(uid: number, data: any) {
    this.server.to(`user:${uid}`).emit('exchange:approved', data);
  }

  // 通知用户积分变动
  emitPointsChange(uid: number, data: any) {
    this.server.to(`user:${uid}`).emit('user:points', data);
  }
}
