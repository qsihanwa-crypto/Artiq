import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function ArtworkPlane({ url, size = [1.1, 1.4], ...props }) {
  const texture = useTexture(url)
  return (
    <mesh {...props}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.95} metalness={0} />
    </mesh>
  )
}

function Easel({ canvasUrl }) {
  return (
    <group position={[0, -0.35, 0]}>
      <mesh position={[-0.55, -0.55, 0.35]} rotation={[0, 0, 0.14]}>
        <cylinderGeometry args={[0.028, 0.028, 1.55, 8]} />
        <meshStandardMaterial color="#171717" />
      </mesh>
      <mesh position={[0.55, -0.55, 0.35]} rotation={[0, 0, -0.14]}>
        <cylinderGeometry args={[0.028, 0.028, 1.55, 8]} />
        <meshStandardMaterial color="#171717" />
      </mesh>
      <mesh position={[0, -0.85, -0.35]} rotation={[0.32, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.35, 8]} />
        <meshStandardMaterial color="#171717" />
      </mesh>
      <mesh position={[0, 0.32, -0.02]} rotation={[-0.07, 0, 0]}>
        <boxGeometry args={[1.5, 1.85, 0.05]} />
        <meshStandardMaterial color="#fafaf8" roughness={1} />
      </mesh>
      <Suspense fallback={null}>
        <ArtworkPlane url={canvasUrl} position={[0, 0.34, 0.02]} rotation={[-0.07, 0, 0]} size={[1.2, 1.48]} />
      </Suspense>
    </group>
  )
}

function Palette({ colors }) {
  return (
    <group position={[0.95, -1.02, 0.45]} rotation={[-0.55, 0.3, 0.08]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.028, 32]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.85} />
      </mesh>
      {colors.map((c, i) => {
        const angle = (i / colors.length) * Math.PI * 1.5 + 0.4
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.27, 0.02, Math.sin(angle) * 0.27]}>
            <sphereGeometry args={[0.042, 16, 16]} />
            <meshStandardMaterial color={c} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function Brush() {
  return (
    <group position={[0.75, -0.7, 0.6]} rotation={[0, 0.4, 1.05]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.022, 0.72, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.034, 0.13, 8]} />
        <meshStandardMaterial color="#e63946" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Rig({ children, reduced }) {
  const group = useRef(null)
  useFrame((state) => {
    if (!group.current) return
    if (reduced) return
    const t = state.clock.getElapsedTime()
    group.current.rotation.y = Math.sin(t * 0.09) * 0.1 + state.pointer.x * 0.12
    group.current.rotation.x = state.pointer.y * 0.04
  })
  return <group ref={group}>{children}</group>
}

export default function StudioCanvas({ canvasArt, floatingArt, paletteColors, reduced }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.15, 4.3], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 2]} intensity={0.6} />
      <directionalLight position={[-2, -1, 2]} intensity={0.2} />
      <Suspense fallback={null}>
        <Rig reduced={reduced}>
          <Easel canvasUrl={canvasArt.image} />
          <Palette colors={paletteColors} />
          <Brush />
          {floatingArt.map((art, i) => (
            <Float key={art.id} speed={reduced ? 0 : 1 + i * 0.2} rotationIntensity={reduced ? 0 : 0.2} floatIntensity={reduced ? 0 : 0.5}>
              <ArtworkPlane
                url={art.image}
                position={[(i - 1) * 1.7, 0.55 + i * 0.12, -1.3 - i * 0.45]}
                rotation={[0, (i - 1) * 0.28, 0]}
                size={[0.85, 1.05]}
              />
            </Float>
          ))}
        </Rig>
      </Suspense>
    </Canvas>
  )
}
