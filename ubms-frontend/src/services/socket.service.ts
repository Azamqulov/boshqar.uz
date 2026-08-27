import { io, Socket } from 'socket.io-client';

class RealtimeSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private currentBusinessId: string | null = null;
  private currentBranchId: string | null = null;

  private getSocketUrl(): string {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
    // Remove '/api/v1' or trailing slashes to get WS server root
    return rawApiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }

  public connect(token: string, businessId?: string | null, branchId?: string | null) {
    if (!token) return;

    // If already connected with the same credentials and room, do not recreate
    if (
      this.socket &&
      this.socket.connected &&
      this.currentBusinessId === businessId &&
      this.currentBranchId === branchId
    ) {
      return;
    }

    this.disconnect();
    this.isConnecting = true;
    this.currentBusinessId = businessId || null;
    this.currentBranchId = branchId || null;

    const serverUrl = this.getSocketUrl();

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
        businessId: businessId || undefined,
      },
      query: {
        token,
        businessId: businessId || undefined,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      if (branchId && this.socket) {
        this.socket.emit('join_branch', branchId);
      }
      window.dispatchEvent(new CustomEvent('ubms:socket-connected'));
    });

    this.socket.on('disconnect', (_reason) => {
      this.isConnecting = false;
      window.dispatchEvent(new CustomEvent('ubms:socket-disconnected'));
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('[Realtime WS] Connection warning:', err.message);
    });
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  public emit(event: string, ...args: any[]) {
    if (!this.socket || !this.socket.connected) return;
    this.socket.emit(event, ...args);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.currentBusinessId = null;
    this.currentBranchId = null;
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }
}

export const socketService = new RealtimeSocketService();
export default socketService;
