import { OrbitControls, useGLTF } from "@react-three/drei/native";
import { Canvas } from "@react-three/fiber/native";
import { Asset } from "expo-asset";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Suspense, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Suppress known warnings
const originalLog = console.log;
console.log = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("gl.pixelStorei() doesn't support this parameter") ||
      args[0].includes("GLTFLoader: Couldn't load texture") ||
      args[0].includes("Creating blobs from"))
  ) {
    return;
  }
  originalLog(...args);
};

// Improved GLB loading with better error handling
const getGLBUri = async () => {
  try {
    const asset = Asset.fromModule(require("../assets/avatar.glb"));
    await asset.downloadAsync();

    // Ensure we have a valid URI
    if (!asset.localUri || typeof asset.localUri !== "string") {
      throw new Error("Invalid asset URI");
    }

    console.log("Avatar GLB loaded successfully:", asset.localUri);
    return asset.localUri;
  } catch (error) {
    console.error("Failed to load avatar GLB:", error);
    throw error;
  }
};

function Avatar({ position = [0, 0, -2] }) {
  const [glbUri, setGlbUri] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // Load GLB URI on mount
  useEffect(() => {
    const loadGLB = async () => {
      try {
        const uri = await getGLBUri();
        setGlbUri(uri);
      } catch (error) {
        console.error("GLB loading failed:", error);
        setLoadError(true);
      }
    };

    loadGLB();
  }, []);

  // Show fallback if no URI or load error
  if (!glbUri || loadError) {
    return <FallbackAvatar position={position} />;
  }

  return <GLBAvatar uri={glbUri} position={position} />;
}

function GLBAvatar({ uri, position }) {
  const [renderError, setRenderError] = useState(false);

  try {
    const { scene } = useGLTF(uri);

    useEffect(() => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh && child.material) {
            // Safely remove textures
            try {
              child.material.map = null;
              child.material.normalMap = null;
              child.material.roughnessMap = null;
              child.material.metalnessMap = null;
              child.material.emissiveMap = null;
              child.material.aoMap = null;

              // Set solid color
              child.material.color.setHex(0x4a90e2);
              child.material.transparent = true;
              child.material.opacity = 0.8;
              child.material.needsUpdate = true;
            } catch (materialError) {
              console.warn("Material processing error:", materialError);
            }
          }
        });
      }
    }, [scene]);

    if (renderError) {
      return <FallbackAvatar position={position} />;
    }

    return (
      <primitive
        object={scene}
        position={position}
        scale={0.5}
        onError={() => setRenderError(true)}
      />
    );
  } catch (error) {
    console.error("GLB Avatar rendering error:", error);
    return <FallbackAvatar position={position} />;
  }
}

// Enhanced fallback avatar with better proportions
function FallbackAvatar({ position = [0, 0, -2] }) {
  return (
    <group position={position} scale={0.8}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#4A90E2"
          transparent
          opacity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.35, 0.1, 0]} rotation={[0, 0, Math.PI / 8]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.35, 0.1, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.1, -0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.1, -0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const { width, height } = Dimensions.get("window");

  // Handle permissions
  useEffect(() => {
    const handlePermission = async () => {
      if (permission === null) return;

      if (!permission.granted) {
        try {
          const result = await requestPermission();
          if (!result.granted) {
            setError("Camera permission denied");
          }
        } catch (err) {
          console.error("Permission request error:", err);
          setError("Failed to request permission");
        }
      } else {
        setError(null);
      }
    };

    handlePermission();
  }, [permission]);

  // Loading state
  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission granted - show camera with avatar
  if (permission.granted) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing="back" />

        <View style={[styles.overlay, { width, height }]}>
          <Canvas>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.4} />
            <directionalLight position={[-5, 10, 5]} intensity={0.3} />
            <spotLight position={[0, 10, 0]} intensity={0.2} />

            <Suspense fallback={<FallbackAvatar />}>
              {useFallback ? <FallbackAvatar /> : <Avatar />}
            </Suspense>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping={true}
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 6}
              maxAzimuthAngle={Math.PI / 4}
              minAzimuthAngle={-Math.PI / 4}
            />
          </Canvas>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setUseFallback(!useFallback)}
          >
            <Text style={styles.controlText}>
              {useFallback ? "Try GLB Model" : "Use Basic Avatar"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Permission denied
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚫 Camera Access Needed</Text>
      <Text style={styles.text}>
        {error || "Please grant camera permission to continue"}
      </Text>

      {permission.canAskAgain ? (
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            try {
              const result = await requestPermission();
              if (!result.granted) {
                setError("Permission denied. Please check device settings.");
              }
            } catch (err) {
              setError("Failed to request permission");
            }
          }}
        >
          <Text style={styles.buttonText}>Request Camera Permission</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.text}>
          Please enable camera access in device settings.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF3B30" }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  controls: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  controlText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
    lineHeight: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 60,
  },
});
