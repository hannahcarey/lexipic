#!/usr/bin/env node

/**
 * Mobile Development IP Configuration Helper
 * This script helps you configure the correct API URL for ExpoGo mobile development
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

function createEnvFile() {
  const ip = getLocalIPAddress();
  const apiUrl = ip !== 'localhost' ? `http://${ip}:3000/api` : 'http://localhost:3000/api';
  
  const envContent = `# ExpoGo Mobile Development Configuration
# Generated automatically by get-ip.js script

# API Configuration for mobile development
EXPO_PUBLIC_API_URL=${apiUrl}

# Your computer's IP address: ${ip}
# Make sure both your computer and mobile device are on the same network

# Alternative localhost URL for web development:
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
`;

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with the following configuration:');
    console.log(`   API URL: ${apiUrl}`);
    console.log(`   Your IP: ${ip}`);
    
    if (ip === 'localhost') {
      console.log('⚠️  Warning: Could not detect network IP address.');
      console.log('   You may need to manually update the .env file with your computer\'s IP address.');
      console.log('   Find it with: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)');
    } else {
      console.log('🎉 ExpoGo should now be able to connect to your backend server!');
      console.log('📱 Make sure to restart your Expo development server after this change.');
    }
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('📝 Please manually create a .env file with:');
    console.log(`   EXPO_PUBLIC_API_URL=${apiUrl}`);
  }
}

function main() {
  console.log('🔍 Finding your computer\'s IP address for ExpoGo mobile development...\n');
  
  const ip = getLocalIPAddress();
  console.log(`🖥️  Computer IP Address: ${ip}`);
  console.log(`🌐 Suggested API URL: http://${ip}:3000/api\n`);
  
  createEnvFile();
  
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your backend server is running (npm run dev)');
  console.log('2. Restart your Expo development server (npm start)');
  console.log('3. Both your computer and phone should be on the same WiFi network');
  console.log('4. Test the connection in ExpoGo');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('- Check firewall settings (allow port 3000)');
  console.log('- Verify both devices are on the same network');
  console.log('- Try disabling VPN if connection fails');
}

if (require.main === module) {
  main();
}

module.exports = { getLocalIPAddress, createEnvFile };
