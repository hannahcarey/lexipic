# 📱 Mobile Development Setup Guide

This guide helps you configure LexiPic for development with ExpoGo on mobile devices.

## 🚨 The Problem

When developing with ExpoGo, your mobile device needs to connect to your computer's development server. The default `localhost` configuration won't work because `localhost` on your phone refers to the phone itself, not your computer.

## ✅ Quick Solution

### 1. Auto-Configure (Recommended)
```bash
cd frontend/expo-fe
npm run setup-mobile
```

This script will:
- ✅ Automatically detect your computer's IP address
- ✅ Create/update the `.env` file with the correct API URL
- ✅ Display troubleshooting tips

### 2. Manual Configuration

**Find your IP address:**
```bash
# Mac
ipconfig getifaddr en0

# Windows  
ipconfig

# Linux
hostname -I | cut -d' ' -f1
```

**Create `.env` file:**
```bash
# In frontend/expo-fe/.env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
```

Example:
```
EXPO_PUBLIC_API_URL=http://10.189.111.158:3000/api
```

## 🚀 Start Development

### 1. Start Backend Server
```bash
cd backend/api
npm run dev
```

The server will display your IP address in the startup logs:
```
🚀 Server running in development mode on port 3000
📱 Mobile access: Make sure to use your computer's IP address (not localhost)
💡 Find your IP: 'ipconfig getifaddr en0' (Mac) or 'ipconfig' (Windows)
```

### 2. Start Frontend
```bash
cd frontend/expo-fe
npm start
```

### 3. Connect with ExpoGo
1. Install ExpoGo app on your mobile device
2. Scan the QR code displayed in your terminal
3. The app should load and connect to your backend

## 🔧 Troubleshooting

### Connection Issues

**Error: "Network request failed"**
- ✅ Both devices on same WiFi network?
- ✅ Backend server running on port 3000?
- ✅ Correct IP address in `.env` file?
- ✅ Firewall allowing port 3000?

**Error: "Unable to resolve host"**
- ❌ Using `localhost` instead of IP address
- 🔄 Run `npm run get-ip` to regenerate config
- 🔄 Restart Expo development server

**Error: CORS blocked**
- ✅ Backend CORS is configured for development
- 🔄 Try restarting backend server
- ❌ Check if VPN is interfering

### Network Configuration

**Firewall Settings:**
- Allow incoming connections on port 3000
- On Mac: System Preferences > Security & Privacy > Firewall
- On Windows: Windows Defender Firewall settings

**WiFi Networks:**
- Both devices must be on same network
- Corporate/school networks might block device-to-device communication
- Guest networks often isolate devices

**VPN Issues:**
- VPNs can interfere with local network connections
- Try temporarily disabling VPN for development

## 🛠️ Advanced Configuration

### Different Networks
If your devices can't be on the same network, consider:
- Using a cloud development service (ngrok, etc.)
- Setting up a local hotspot
- Using Expo's tunnel option: `npx expo start --tunnel`

### Production Deployment
For production, replace the IP address with your actual server URL:
```
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Multiple Developers
Each developer needs to:
1. Run `npm run setup-mobile` on their machine
2. Use their own computer's IP address
3. Be on the same network as their test device

## 📝 Scripts Reference

```bash
# Auto-configure mobile development
npm run setup-mobile

# Get current IP address
npm run get-ip

# Start with tunnel (slower but works across networks)
npx expo start --tunnel

# Start normal development
npm start
```

## ✅ Verification

To verify everything is working:

1. **Backend Health Check:**
   ```bash
   curl http://YOUR_IP:3000/api/health
   ```

2. **Frontend Connection:**
   - Open ExpoGo app
   - Should see login screen
   - Try logging in/registering

3. **API Communication:**
   - Login should work
   - Flashcard loading should work
   - No "Network request failed" errors

## 🆘 Still Having Issues?

1. **Check the logs:**
   - Backend server logs for CORS errors
   - Expo logs for network errors
   - Mobile device logs in ExpoGo

2. **Test step by step:**
   - Can you ping your computer from your phone? (use network scanner apps)
   - Can you access `http://YOUR_IP:3000` from your phone's browser?
   - Are there any firewall notifications when starting the server?

3. **Alternative solutions:**
   - Use `npx expo start --tunnel` (slower but more reliable)
   - Use an Android/iOS emulator instead of physical device
   - Consider using Expo Development Build instead of ExpoGo

---

*This setup is only needed for development. Production apps will use your deployed API URL.*
