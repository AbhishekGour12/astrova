import { Device } from '@twilio/voice-sdk';
import { io } from 'socket.io-client';

class TwilioCallClient {
  constructor() {
    this.device = null;
    this.connection = null;
    this.socket = null;
    this.isInitialized = false;
    this.callbacks = {
      onReady: [],
      onError: [],
      onIncoming: [],
      onConnect: [],
      onDisconnect: []
    };
  }

  async initialize(identity) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/call/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity })
        }
      );

      const data = await res.json();
      console.log(data)
      if (!data.success) throw new Error(data.message);

      this.device = new Device(data.token, {
        codecPreferences: ['opus', 'pcmu'],
        enableRingingState: true
      });

      this.device.on('registered', () => {
        this.emit('onReady');
      });

      this.device.on('incoming', (call) => {
        this.connection = call;
        this.emit('onIncoming', call);
      });

      this.device.on('error', (error) => {
        this.emit('onError', error);
      });

      this.device.on('disconnect', () => {
        this.connection = null;
        this.emit('onDisconnect');
      });

      await this.device.register();

      this.connectSocket(identity);
      this.isInitialized = true;
      return this.device;

    } catch (err) {
      console.error('Twilio init failed:', err);
      throw err;
    }
  }

  async makeCall(to) {
    if (!this.device) throw new Error('Device not ready');

    this.connection = await this.device.connect({
      params: { To: to }
    });

    return this.connection;
  }

  endCall() {
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }
  }

  connectSocket(identity) {
    this.socket = io(process.env.NEXT_PUBLIC_API);
  }

  destroy() {
    if (this.connection) this.connection.disconnect();
    if (this.device) this.device.destroy();
    if (this.socket) this.socket.disconnect();

    this.device = null;
    this.connection = null;
    this.socket = null;
    this.isInitialized = false;
  }

  on(event, cb) {
    this.callbacks[event]?.push(cb);
  }

  emit(event, data) {
    this.callbacks[event]?.forEach(cb => cb(data));
  }
}

export default new TwilioCallClient();
