const MessageService = require('./message.service');
const RoomMemberRepository = require('../repositories/roomMember.repository');
const FlowService = require('./flow/flow.service');
const MessageRepository = require('../repositories/message.repository')
class SocketService {
  constructor(io) {
    this.io = io;
  }

  async userConnected(userId, socketId) {
    console.log(`✅ User ${userId} connected (${socketId})`);
    this.io.emit('user_online', { userId });
  }

  async userDisconnected(userId) {
    console.log(`❌ User ${userId} disconnected`);
    this.io.emit('user_offline', { userId });
  }

  async joinRoom(socket, roomId) {
    const member = await RoomMemberRepository.findOne(roomId, socket.user.id);
    if (!member) {
      socket.emit('error', { message: 'You are not a member of this room' });
      return;
    }

    socket.join(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('user_joined', {
      userId: socket.user.id
    });
  }

  async leaveRoom(socket, roomId) {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('user_left', {
      userId: socket.user.id
    });
  }

  async sendMessage(socket, roomId, payload) {
    try {
      const engineInput = typeof payload === 'object' ? JSON.stringify(payload) : payload;
      // 1. Original message save aur broadcast
      const savedMessage = await MessageService.sendMessage(socket.user.id, roomId, payload);
      this.io.to(`room:${roomId}`).emit("new_message", savedMessage);

      // 2. Room ke members nikalen (Recipients)
      const members = await RoomMemberRepository.findAllByRoom(roomId);
      const recipients = members
        .map((m) => m.user_id)
        .filter((id) => id !== socket.user.id);

      // 3. LOGIC: Pehle Sender ka state update karein (to resolve their button click)
      // Hum sirf state update kar rahe hain, responses emit nahi kar rahe sender ke liye
      await FlowService.handleMessage({
        roomId,
        userId: socket.user.id,
        text: engineInput,
        silent: true
      });

      // 4. LOGIC: Ab Recipient(s) ke liye flow trigger karein
      for (const recipientId of recipients) {
        const outputs = await FlowService.handleMessage({
          roomId,
          userId: recipientId,
          text: engineInput
        });

        console.log("recipientId:", recipientId);
        console.log("outputs:", JSON.stringify(outputs));


        // Bot responses ko room mein emit karein
        if (outputs && outputs.length > 0) {
          // for (const res of outputs) {
          //   await new Promise(resolve => setTimeout(resolve, 800));
          //   const botMsg = await MessageRepository.create({
          //     room_id: roomId,
          //     sender_id: null,
          //     type: "text",
          //     content: res.text,
          //     body: { buttons: res.buttons || [], bot: true, forUserId: recipientId}
          //   });
          //   this.io.to(`room:${roomId}`).emit("new_message", botMsg);
          // }
          for (const res of outputs) {
            await new Promise(resolve => setTimeout(resolve, 800));

            // ✅ Handle image vs text
            const isImage = res.type === "image";

            const botMsg = await MessageRepository.create({
              room_id: roomId,
              sender_id: null,
              type: res.type,                           // "image" or "text"
              content: isImage
                ? (res.image?.link ?? "")              // image URL as content
                : (res.text ?? ""),                    // text as content
              body: {
                type: res.type,                        // type in body too
                ...(isImage && { image: res.image }),  // image data
                buttons: res.buttons || [],
                bot: true,
                forUserId: recipientId,
              }
            });

            this.io.to(`room:${roomId}`).emit("new_message", botMsg);
          }
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  typing(socket, roomId, isTyping) {
    socket.to(`room:${roomId}`).emit('typing', {
      userId: socket.user.id,
      isTyping
    });
  }

  async markRead(socket, messageId) {
    await MessageService.markAsRead(socket.user.id, messageId);

    this.io.emit('message_read', {
      messageId,
      userId: socket.user.id
    });
  }
}

module.exports = SocketService;