# 3D Avatar Camera App

A React Native Expo application that overlays interactive 3D avatars onto your camera feed using Three.js and React Three Fiber.

## ✨ Features

- **Real-time Camera Integration** - Live camera feed with 3D overlay
- **3D Avatar Rendering** - Support for GLB/GLTF 3D models
- **Fallback Avatar System** - Procedural 3D avatar when model loading fails
- **Interactive Controls** - Touch controls to rotate and position avatar
- **Cross-Platform** - Works on both iOS and Android
- **Smart Error Handling** - Graceful fallbacks for common React Native 3D issues

## 🛠️ Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and build system
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Expo Camera** - Camera access and permissions
- **Expo Router** - File-based routing

## 📋 Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)
- Physical device recommended for camera testing

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd 3d-avatar-camera-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo dependencies**
   ```bash
   npx expo install
   ```

## 📁 Project Structure

```
├── app/
│   ├── camera.js          # Main camera screen component
│   └── index.js           # Home/entry screen
├── assets/
│   └── avatar.glb         # 3D avatar model (place your GLB file here)
├── components/            # Reusable components (if any)
├── package.json
└── README.md
```

## 🎯 Usage

### Development

1. **Start the development server**

   ```bash
   npx expo start
   ```

2. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

### Adding Your 3D Avatar

1. **Prepare your 3D model**

   - Export your model as a GLB file
   - Optimize for mobile (low poly count recommended)
   - Ensure textures are embedded or remove them

2. **Add to project**

   ```bash
   # Place your GLB file in the assets folder
   cp your-avatar.glb assets/avatar.glb
   ```

3. **Model requirements**
   - Format: GLB (preferred) or GLTF
   - Size: < 10MB recommended
   - Textures: Embedded or will be removed automatically

## 🔧 Configuration

### Camera Settings

In `camera.js`, you can modify:

```javascript
// Camera facing direction
<CameraView style={styles.camera} facing="back" /> // or "front"

// Avatar position and scale
<Avatar position={[0, 0, -2]} scale={0.5} />

// Orbit controls constraints
<OrbitControls
  enableZoom={false}
  maxPolarAngle={Math.PI / 2}
  minPolarAngle={Math.PI / 6}
/>
```

### Lighting Setup

Adjust the lighting for your avatar:

```javascript
<ambientLight intensity={0.6} />
<pointLight position={[10, 10, 10]} intensity={0.4} />
<directionalLight position={[-5, 10, 5]} intensity={0.3} />
```

## 🎨 Customization

### Avatar Appearance

The fallback avatar can be customized in the `FallbackAvatar` component:

```javascript
// Change colors
<meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />

// Modify proportions
<sphereGeometry args={[0.25, 16, 16]} /> // Head size
<cylinderGeometry args={[0.15, 0.2, 0.6, 8]} /> // Body dimensions
```

### UI Styling

Modify styles in the `StyleSheet.create()` section:

```javascript
const styles = StyleSheet.create({
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.7)", // Button background
    borderRadius: 25, // Button roundness
  },
  // ... other styles
});
```

## 📱 Platform-Specific Notes

### iOS

- Camera permissions handled automatically
- Ensure "Privacy - Camera Usage Description" is set in app.json
- Test on physical device for best performance

### Android

- Requires CAMERA permission in app.json
- May need additional permissions for newer Android versions
- Performance varies by device GPU capabilities

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot read property 'trim' of undefined"**

   - Usually related to GLB loading - ensure your GLB file is valid
   - Try using the fallback avatar first

2. **"Creating blobs from ArrayBuffer not supported"**

   - This is a React Native limitation - the app handles this automatically
   - Textures are removed from GLB models to prevent this error

3. **Camera permission denied**

   - Check device settings
   - Restart the app after granting permissions

4. **Avatar not visible**
   - Check avatar position and scale
   - Verify lighting setup
   - Try the fallback avatar to isolate issues

### Performance Issues

- **Reduce polygon count** in your 3D model
- **Remove or simplify textures**
- **Test on physical device** rather than simulator
- **Close other apps** to free up memory

## 🔐 Permissions

The app requires the following permissions:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow access to camera for AR avatar experience"
        }
      ]
    ]
  }
}
```

## 📦 Building for Production

### Development Build

```bash
npx expo build
```

### EAS Build (Recommended)

```bash
npm install -g @expo/eas-cli
eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D graphics library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Expo](https://expo.dev/) - React Native development platform
- [React Three Drei](https://github.com/pmndrs/drei) - Useful helpers for R3F

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)

---

**Made with ❤️ using React Native and Three.js**
