import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all for testing
  },
})
export class WebrtcGateway {
  @WebSocketServer()
  server: Server;

  // Keep track of connected users
  private users: Record<string, string> = {};

  // ✅ When user connects
  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  // ✅ When user disconnects
  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
    delete this.users[socket.id];
  }

  // ✅ When broadcaster starts live
  @SubscribeMessage('broadcaster')
  handleBroadcaster(@ConnectedSocket() socket: Socket) {
    this.users[socket.id] = 'broadcaster';
    socket.broadcast.emit('broadcaster', socket.id);
  }

  // ✅ When new listener joins
  @SubscribeMessage('watcher')
  handleWatcher(@ConnectedSocket() socket: Socket, @MessageBody() broadcasterId: string) {
    socket.to(broadcasterId).emit('watcher', socket.id);
  }

  // ✅ When offer from broadcaster
  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { id: string; offer: any },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.id).emit('offer', { id: socket.id, offer: data.offer });
  }

  // ✅ When answer from watcher
  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { id: string; answer: any },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.id).emit('answer', { id: socket.id, answer: data.answer });
  }

  // ✅ ICE Candidate exchange
  @SubscribeMessage('candidate')
  handleCandidate(
    @MessageBody() data: { id: string; candidate: any },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.id).emit('candidate', {
      id: socket.id,
      candidate: data.candidate,
    });
  }

  // ✅ Stop broadcasting
  @SubscribeMessage('stop-broadcast')
  handleStop(@ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('stop-broadcast');
  }
}
