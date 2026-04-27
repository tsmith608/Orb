"use client";
{/* 
        3D Orb using Three.js vanilla sphere geometry

        https://threejs.org/docs/#api/en/geometries/SphereGeometry
        Lighting: https://threejs.org/docs/#api/en/lights/AmbientLight
        Fog: https://threejs.org/docs/#api/en/scenes/Fog
        Wireframe: https://threejs.org/docs/#api/en/materials/Material.wireframe
*/}

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

interface OrbProps {
  isThinking: boolean;
  analyser?: AnalyserNode;
}

function OrbCore({ isThinking, analyser }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const freqData = useRef(new Uint8Array(0));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let intensity = 0;

    // React to Audio
    if (analyser) {
      if (freqData.current.length !== analyser.frequencyBinCount) {
        freqData.current = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(freqData.current);
      
      // Calculate average frequency for scaling
      const sum = freqData.current.reduce((a, b) => a + b, 0);
      intensity = sum / freqData.current.length / 255; // Normalize 0-1
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = time * 0.1;

      // Dubstep Visualizer
      // Scale reacts to volume, plus a base breathing effect when thinking
      const baseScale = isThinking ? 0.7 + Math.sin(time * 3) * 0.05 : 0.7;
      const audioScale = intensity * 0.72;
      meshRef.current.scale.setScalar(baseScale + audioScale);
    }

    if (materialRef.current) {
      // Distortion
      materialRef.current.distort = 0.2 + intensity * 0.8;
      materialRef.current.speed = 1.5 + intensity * 10;
      
      // Color
      const targetColor = intensity > 0.1 ? "#60a5fa" : isThinking ? "#3b82f6" : "#2563eb";
      materialRef.current.color.lerp(new THREE.Color(targetColor), 0.2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#2563eb"
          roughness={0.1}
          metalness={0.8}
          distort={0.2}
          speed={1.5}
          wireframe={true}
        />
      </Sphere>
    </Float>
  );
}

export default function Orb(props: OrbProps) {
  return (
    <div className="w-full h-full relative group">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <fog attach="fog" args={["black", 1, 5]} />
        <ambientLight intensity={3.5} />
        <pointLight position={[10, 10, 10]} intensity={3.0} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={2.0} color="#2563eb" />
        <OrbCore {...props} />
      </Canvas>
    </div>
  );
}
