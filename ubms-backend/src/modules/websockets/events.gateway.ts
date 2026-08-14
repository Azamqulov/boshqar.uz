import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1. Extract Bearer token from auth object, headers, or query
      const authHeader = client.handshake.headers?.authorization;
      const rawToken =
        client.handshake.auth?.token ||
        (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
        (client.handshake.query?.token as string);

      if (!rawToken) {
        this.logger.warn(`WS Connection rejected: No auth token provided (socket: ${client.id})`);
        client.disconnect(true);
        return;
      }

      // 2. Verify JWT signature & expiration
      const payload = this.jwtService.verify(rawToken, {
        secret: process.env.JWT_SECRET || 'boshqar-jwt-secret-key-super-secure',
      });

      const userId = payload.sub || payload.userId;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      // 3. Verify user status and tokenVersion in database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          businessUsers: { where: { status: 'active' } },
          ownedBusinesses: true,
        },
      });

      if (!user || user.status !== 'active') {
        client.disconnect(true);
        return;
      }

      if (payload.tokenVersion !== undefined && user.tokenVersion !== undefined) {
        if (payload.tokenVersion !== user.tokenVersion) {
          this.logger.warn(`WS Connection rejected: Token revoked for user ${user.id}`);
          client.disconnect(true);
          return;
        }
      }

      // 4. Attach verified user identity to socket data
      client.data.user = user;

      // 5. Determine and verify businessId
      const requestedBusinessId =
        (client.handshake.query?.businessId as string) ||
        (client.handshake.auth?.businessId as string) ||
        payload.businessId;

      let verifiedBusinessId: string | undefined = undefined;

      if (user.isSuperAdmin && requestedBusinessId) {
        verifiedBusinessId = requestedBusinessId;
      } else if (requestedBusinessId) {
        const isOwner = user.ownedBusinesses.some((b) => b.id === requestedBusinessId);
        const isMember = user.businessUsers.some((bu) => bu.businessId === requestedBusinessId);

        if (isOwner || isMember) {
          verifiedBusinessId = requestedBusinessId;
        }
      } else {
        if (user.ownedBusinesses.length > 0) {
          verifiedBusinessId = user.ownedBusinesses[0].id;
        } else if (user.businessUsers.length > 0) {
          verifiedBusinessId = user.businessUsers[0].businessId;
        }
      }

      if (verifiedBusinessId) {
        client.data.verifiedBusinessId = verifiedBusinessId;
        await client.join(`business_${verifiedBusinessId}`);
        this.logger.log(`Socket ${client.id} joined business room: business_${verifiedBusinessId}`);
      } else if (!user.isSuperAdmin) {
        this.logger.warn(`WS Connection: User has no verified business association (socket: ${client.id})`);
        client.disconnect(true);
        return;
      }
    } catch (err: any) {
      this.logger.error(`WS Connection error: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up
  }

  @SubscribeMessage('join_branch')
  async handleJoinBranch(client: Socket, branchId: string) {
    const user = client.data?.user;
    const verifiedBusinessId = client.data?.verifiedBusinessId;

    if (!user || !branchId) {
      return { status: 'error', message: 'Autentifikatsiya qilinmagan' };
    }

    if (!user.isSuperAdmin && verifiedBusinessId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, businessId: verifiedBusinessId },
      });

      if (!branch) {
        return { status: 'error', message: 'Ushbu filialga kirish huquqi mavjud emas' };
      }
    }

    await client.join(`branch_${branchId}`);
    return { status: 'joined', branchId };
  }

  emitOrderCreated(businessId: string, branchId: string, order: Record<string, unknown>) {
    this.server.to(`business_${businessId}`).emit('order.created', order);
    if (branchId) {
      this.server.to(`branch_${branchId}`).emit('order.created', order);
    }
  }

  emitOrderCompleted(businessId: string, branchId: string, order: Record<string, unknown>) {
    this.server.to(`business_${businessId}`).emit('order.completed', order);
    if (branchId) {
      this.server.to(`branch_${branchId}`).emit('order.completed', order);
    }
  }

  emitKitchenStatusChanged(branchId: string, kitchenOrder: Record<string, unknown>) {
    this.server.to(`branch_${branchId}`).emit('kitchen.status_changed', kitchenOrder);
  }
}
