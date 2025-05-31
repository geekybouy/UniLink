
import React, { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshWobbleMaterial, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Simple 3D card geometry with glassmorphism style
function CredentialCard({
  position,
  color1,
  color2,
  icon,
  rotateY = 0,
  scale = 1,
}: {
  position: [number, number, number];
  color1: string;
  color2: string;
  icon?: React.ReactNode;
  rotateY?: number;
  scale?: number;
}) {
  // Animate rotation with a little floating effect
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotateY + Math.sin(clock.getElapsedTime() * 0.6) * 0.18;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.12;
    }
  });

  return (
    <Float floatIntensity={2} speed={2}>
      <mesh ref={meshRef} position={position} scale={[scale, scale, scale * 0.16]}>
        <boxGeometry args={[1.7, 1.1, 0.09]} />
        <MeshWobbleMaterial
          // Use color as a direct prop as MeshWobbleMaterial is a Drei extension.
          color={color1}
          factor={0.17}
          speed={2}
          transparent
          opacity={0.55}
          envMapIntensity={1.2}
          metalness={0.28}
        />
        {/* Optional overlay icon */}
        <HtmlCardIcon icon={icon} />
      </mesh>
    </Float>
  );
}

// Helper for simple HTML icon overlay on the card
function HtmlCardIcon({ icon }: { icon?: React.ReactNode }) {
  if (!icon) return null;
  // Use Drei's Html if you want, or just skip for now for performance (could be upgraded)
  return null;
}

function AnimatedCredentialCards() {
  // You can use Lucide icons or simple SVGs for overlaid icons if desired.
  // We'll position several cards in 3D space.
  // Colors from user palette.
  const palette = {
    emerald: "#10B981",
    teal: "#14B8A6",
    gold: "#F59E0B",
    orange: "#F97316",
    white: "#FFFFFF",
    slate: "#475569",
    greenD: "#059669",
    cardBG: "rgba(255,255,255,0.16)",
  };

  return (
    <div style={{ width: "100%", minHeight: 420, height: "38vw", maxHeight: 560 }}>
      <Canvas camera={{ position: [3.2, 2.2, 4.8], fov: 36 }}>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[2, 6, 9]}
          intensity={1.4}
          color={palette.gold}
        />
        {/* Main floating cards */}
        <CredentialCard position={[-1.3, 0.4, 0]} color1={palette.emerald} color2={palette.teal} rotateY={0.2} scale={1.2} />
        <CredentialCard position={[0, -0.78, 0.48]} color1={palette.orange} color2={palette.gold} rotateY={-0.33} scale={0.93} />
        <CredentialCard position={[1.1, 1.09, -0.3]} color1={palette.teal} color2={palette.emerald} rotateY={0.76} scale={0.88} />
        <CredentialCard position={[0.5, 0.1, -1.1]} color1={palette.gold} color2={palette.orange} rotateY={-0.49} scale={1.09} />
        {/* Glowing sphere for accent */}
        <mesh position={[-2.3, 2, -1.4]}>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial
            args={[{ color: palette.gold }]}
            emissive={palette.gold}
            emissiveIntensity={1.1}
            transparent
            opacity={0.5}
          />
        </mesh>
        {/* Subtle blurred plane for glassmorphism effect */}
        <mesh position={[0, -1.1, 0]}>
          <planeGeometry args={[4.3, 2.2]} />
          <meshStandardMaterial
            args={[{ color: "#fff" }]}
            transparent
            opacity={0.08}
          />
        </mesh>
        {/* Parallax effect by rotating whole group */}
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 2.3} enableRotate={true} />
      </Canvas>
    </div>
  );
}

export default AnimatedCredentialCards;
