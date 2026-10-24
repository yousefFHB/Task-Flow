class SocketState {
  constructor() {
    // map of userId=>set active socketIds
    this.userSockets = new Map();
    // map of socketId=>userId
    this.socketUserMap = new Map();
  }
  addUserSocket(userId, socketId) {
    const uId = userId.toString();
    if (!this.userSockets.has(uId)) {
      this.userSockets.set(uId, new Set());
    }
    const sockets = this.userSockets.get(uId);
    const isFirstConnection = sockets.size == 0;
    sockets.add(socketId);
    this.socketUserMap.set(socketId, uId);
    return isFirstConnection;
  }
  removeSocket(socketId) {
    const userId = this.socketUserMap.get(socketId);
    if (!userId) {
      return { userId: null, isOffline: false };
    }
    this.socketUserMap.delete(socketId);
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size == 0) {
        this.userSockets.delete(userId);
        return { userId, isOffline: true };
      }
    }
    return { userId, isOffline: false };
  }
  isUserOnline(userId) {
    const uId = userId.toString();
    return this.userSockets.has(uId) && this.userSockets.get(uId).size > 0;
  }
  getUserSockets(userId) {
    const uId = userId.toString();
    const sockets = this.userSockets.get(uId);
    return sockets?Array.from(sockets):[]
  }
  getOnlineUserIds(){
    return Array.from(this.userSockets.keys())
  }
}

const socketState=new SocketState()
export default socketState