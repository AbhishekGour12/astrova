import { HMSReactiveStore } from '@100mslive/hms-video-store';
import { toast } from 'react-hot-toast';

class HMSClient {
  constructor() {
    this.hmsStore = new HMSReactiveStore();
    this.hmsActions = this.hmsStore.getHMSActions();
    this.hmsNotifications = this.hmsStore.getNotifications();
    
    this.room = null;
    this.isInitialized = false;
    this.isJoining = false;
    this.unsubscribeCallbacks = [];
    
    this.callbacks = {
      onJoin: [],
      onPeerJoin: [],
      onPeerLeave: [],
      onTrackUpdate: [],
      onError: [],
      onLeave: [],
      onRoomUpdate: []
    };
  }

  // Initialize HMS
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initializing HMS Client...');
      
      // Setup store subscription
      const unsubscribe = this.hmsStore.subscribe(this.handleStoreUpdate.bind(this));
      this.unsubscribeCallbacks.push(unsubscribe);
      
      // Setup notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('✅ HMS Client initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize HMS:', error);
      this.emit('onError', error);
      throw error;
    }
  }

  // Setup notification listeners
  setupNotificationListeners() {
    this.hmsNotifications.onPeersUpdate((notification) => {
      if (notification.type === 'PEER_JOINED') {
        const peer = notification.data[0];
        console.log('👤 Peer joined:', peer.name);
        this.emit('onPeerJoin', peer);
      }
      
      if (notification.type === 'PEER_LEFT') {
        const peer = notification.data[0];
        console.log('👤 Peer left:', peer?.name || 'Unknown');
        this.emit('onPeerLeave', peer || {});
      }
    });

    this.hmsNotifications.onTrackUpdate((track, type, peer) => {
      console.log('🎵 Track update:', type, track?.source);
      this.emit('onTrackUpdate', { track, type, peer });
    });

    this.hmsNotifications.onError((error) => {
      console.error('❌ HMS error:', error);
      this.emit('onError', error);
      toast.error(`Call error: ${error.message || 'Unknown error'}`);
    });

    this.hmsNotifications.onRoomUpdate((notification) => {
      if (notification.type === 'ROOM_JOINED') {
        console.log('✅ Room joined successfully');
        this.room = this.hmsStore.getState().hmsStates.room;
        this.emit('onJoin', { 
          success: true, 
          room: this.room,
          localPeer: this.getLocalPeer()
        });
      }
      
      if (notification.type === 'ROOM_LEFT') {
        console.log('🚪 Left room');
        this.room = null;
        this.emit('onLeave', {});
      }
    });
  }

  // Join a room with token
  async joinRoom(authToken, userName) {
    if (this.isJoining) return false;
    
    try {
      this.isJoining = true;
      console.log('🔗 Joining 100ms room...');
      
      if (!authToken) {
        throw new Error('No auth token provided');
      }

      const joinConfig = {
        authToken: authToken,
        userName: userName || 'Participant',
        metaData: JSON.stringify({ 
          joinedAt: new Date().toISOString(),
          platform: 'web',
          userRole: userName?.includes('astrologer') ? 'astrologer' : 'user'
        }),
        settings: {
          isAudioMuted: false,
          isVideoMuted: true, // Voice only by default
          audioInputDeviceId: 'default',
          audioOutputDeviceId: 'default'
        },
        rememberDeviceSelection: true
      };

      await this.hmsActions.join(joinConfig);
      this.isJoining = false;
      return true;
    } catch (error) {
      this.isJoining = false;
      console.error('❌ Failed to join room:', error);
      this.emit('onError', error);
      toast.error('Failed to join call room');
      throw error;
    }
  }

  // Leave room
  async leaveRoom() {
    try {
      if (this.isConnected()) {
        console.log('👋 Leaving room...');
        await this.hmsActions.leave();
      }
      this.room = null;
      this.isJoining = false;
      return true;
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      return false;
    }
  }

  // Toggle mute
  toggleMute(mute = true) {
    try {
      const localPeer = this.getLocalPeer();
      if (localPeer?.audioTrack) {
        this.hmsActions.setLocalAudioEnabled(!mute);
        return !mute;
      }
      return this.isLocalAudioEnabled();
    } catch (error) {
      console.error('❌ Error toggling mute:', error);
      return false;
    }
  }

  // Check if local audio is enabled
  isLocalAudioEnabled() {
    try {
      const localPeer = this.getLocalPeer();
      return localPeer?.audioTrack?.enabled || false;
    } catch (error) {
      console.error('❌ Error checking audio state:', error);
      return false;
    }
  }

  // Toggle speaker (audio output)
  async toggleSpeaker(enable = true) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');
      
      if (audioOutputDevices.length > 0) {
        const deviceId = enable ? 'default' : audioOutputDevices[0].deviceId;
        await this.hmsActions.setAudioOutputDevice(deviceId);
        return enable;
      }
      return false;
    } catch (error) {
      console.error('❌ Error toggling speaker:', error);
      return false;
    }
  }

  // Get room state
  getRoomState() {
    return this.hmsStore.getState();
  }

  // Get local peer
  getLocalPeer() {
    const state = this.getRoomState();
    return state.hmsStates.localPeer;
  }

  // Get remote peers
  getRemotePeers() {
    const state = this.getRoomState();
    return state.hmsStates.remotePeers || [];
  }

  // Get first remote peer (for 1:1 call)
  getRemotePeer() {
    const remotePeers = this.getRemotePeers();
    return remotePeers.length > 0 ? remotePeers[0] : null;
  }

  // Check if room is connected
  isConnected() {
    const state = this.getRoomState();
    return state.hmsStates.isConnected || false;
  }

  // Check if peer is in room
  isPeerInRoom(peerId) {
    const remotePeers = this.getRemotePeers();
    return remotePeers.some(peer => peer.peerId === peerId);
  }

  // Handle store updates
  handleStoreUpdate(state, prevState) {
    const room = state.hmsStates.room;
    
    if (room && room !== this.room) {
      this.room = room;
      this.emit('onRoomUpdate', room);
    }
  }

  // Event handling
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    } else {
      console.warn(`Unknown event: ${event}`);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Cleanup
  destroy() {
    try {
      this.leaveRoom();
      
      // Unsubscribe from all listeners
      this.unsubscribeCallbacks.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      
      this.unsubscribeCallbacks = [];
      this.isInitialized = false;
      this.isJoining = false;
      
      // Clear all callbacks
      Object.keys(this.callbacks).forEach(key => {
        this.callbacks[key] = [];
      });
      
      console.log('🧹 HMS Client cleaned up');
    } catch (error) {
      console.error('❌ Error during HMS client cleanup:', error);
    }
  }
}

// Export singleton instance
const hmsClient = new HMSClient();
export default hmsClient;