// test-hms.js
import hmsClient from './lib/hmsClient';

async function testHMS() {
  try {
    console.log('Testing HMS Client...');
    
    // Initialize
    await hmsClient.initialize();
    console.log('✅ Initialization successful');
    
    // Test methods
    console.log('Methods available:');
    console.log('- joinRoom:', typeof hmsClient.joinRoom);
    console.log('- leaveRoom:', typeof hmsClient.leaveRoom);
    console.log('- toggleMute:', typeof hmsClient.toggleMute);
    console.log('- isConnected:', typeof hmsClient.isConnected);
    
    // Cleanup
    hmsClient.cleanup();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHMS();