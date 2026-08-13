import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const businessId = client.handshake.query.businessId as string;
    if (businessId) {
      client.join(`business_${businessId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // client left
  }

  @SubscribeMessage('join_branch')
  handleJoinBranch(client: Socket, branchId: string) {
    client.join(`branch_${branchId}`);
    return { status: 'joined', branchId };
  }

  emitOrderCreated(businessId: string, branchId: string, order: Record<string, unknown>) {
    this.server.to(`business_${businessId}`).emit('order.created', order);
    this.server.to(`branch_${branchId}`).emit('order.created', order);
  }

  emitOrderCompleted(businessId: string, branchId: string, order: Record<string, unknown>) {
    this.server.to(`business_${businessId}`).emit('order.completed', order);
    this.server.to(`branch_${branchId}`).emit('order.completed', order);
  }

  emitKitchenStatusChanged(branchId: string, kitchenOrder: Record<string, unknown>) {
    this.server.to(`branch_${branchId}`).emit('kitchen.status_changed', kitchenOrder);
  }
}
