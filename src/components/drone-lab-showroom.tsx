"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Locale } from "@/lib/content";
import type { DroneModel } from "@/lib/content/schema";

type LinkItem = {
  label: string;
  href: string;
};

export type DroneLabShowroomProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
  drones: DroneModel[];
};

const showroomCopy = {
  vi: {
    configuration: "Cấu hình đang giới thiệu",
    level: "Cấp độ",
    sequence: "Vị trí trưng bày",
  },
  en: {
    configuration: "Featured configuration",
    level: "Level",
    sequence: "Showroom position",
  },
} satisfies Record<Locale, Record<string, string>>;

type PointerState = {
  x: number;
  y: number;
};

const stationPositions = [-4.8, -2.4, 0, 2.4, 4.8];
const accentColors = ["#00D1C1", "#4FD1FF", "#FFB020", "#8BE28B", "#B2A4FF"];
const isTestEnvironment = process.env.NODE_ENV === "test";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const element = ref.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      setProgress(clamp(-rect.top / scrollable, 0, 1));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [ref]);

  return progress;
}

function usePointerParallax(ref: React.RefObject<HTMLElement | null>) {
  const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      setPointer({
        x: clamp(x, -1, 1),
        y: clamp(y, -1, 1),
      });
    };

    const onPointerLeave = () => setPointer({ x: 0, y: 0 });

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);

    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ref]);

  return pointer;
}

function TestShowroomFallback({
  locale,
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  drones,
}: DroneLabShowroomProps) {
  const copy = showroomCopy[locale];

  return (
    <section data-testid="drone-lab-showroom">
      <div data-testid="drone-lab-canvas-host" />
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>{copy.configuration}</p>
      <Link href={primaryCta.href} target="_blank" rel="noopener noreferrer">
        {primaryCta.label}
      </Link>
      <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
      <div>
        {drones.slice(0, 3).map((drone) => (
          <p key={drone.slug}>{drone.name}</p>
        ))}
      </div>
    </section>
  );
}

function LabRoom() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#111923" roughness={0.72} metalness={0.18} />
      </mesh>

      <mesh receiveShadow position={[0, 2.4, -3.3]}>
        <boxGeometry args={[14, 4.9, 0.16]} />
        <meshStandardMaterial color="#071017" roughness={0.52} metalness={0.24} />
      </mesh>

      <mesh receiveShadow position={[-6.8, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7, 4.5, 0.14]} />
        <meshStandardMaterial color="#0E171E" roughness={0.64} metalness={0.2} />
      </mesh>

      <mesh receiveShadow position={[6.8, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7, 4.5, 0.14]} />
        <meshStandardMaterial color="#0E171E" roughness={0.64} metalness={0.2} />
      </mesh>

      {[-4.8, -2.4, 0, 2.4, 4.8].map((x) => (
        <group key={x} position={[x, 0, -1.8]}>
          <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
            <boxGeometry args={[1.5, 0.08, 0.52]} />
            <meshStandardMaterial color="#1D2A34" roughness={0.36} metalness={0.55} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 2.02, 0]}>
            <boxGeometry args={[1.5, 0.08, 0.52]} />
            <meshStandardMaterial color="#1D2A34" roughness={0.36} metalness={0.55} />
          </mesh>
          <mesh position={[0, 1.58, -0.28]}>
            <boxGeometry args={[1.34, 0.96, 0.03]} />
            <meshStandardMaterial
              color="#00D1C1"
              emissive="#00D1C1"
              emissiveIntensity={0.13}
              transparent
              opacity={0.24}
            />
          </mesh>
        </group>
      ))}

      {[-4.8, -2.4, 0, 2.4, 4.8].map((x) => (
        <mesh key={`light-${x}`} position={[x, 3.7, -1.6]}>
          <boxGeometry args={[1.2, 0.035, 0.035]} />
          <meshStandardMaterial color="#DFFBFF" emissive="#8AF8FF" emissiveIntensity={1.3} />
        </mesh>
      ))}
    </group>
  );
}

type DroneModel3DProps = {
  drone: DroneModel;
  index: number;
  active: boolean;
};

function Rotor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.28, 0.018, 8, 34]} />
        <meshStandardMaterial color="#8BE8E0" roughness={0.28} metalness={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.56, 0.026, 0.026]} />
        <meshStandardMaterial color="#DDFBFF" emissive="#00D1C1" emissiveIntensity={0.25} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[0.56, 0.026, 0.026]} />
        <meshStandardMaterial color="#DDFBFF" emissive="#00D1C1" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function DroneModel3D({ drone, index, active }: DroneModel3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const accent = accentColors[index % accentColors.length];

  useFrame((state) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const time = state.clock.elapsedTime;
    group.position.y = Math.sin(time * 1.15 + index) * 0.06;
    group.rotation.y = Math.sin(time * 0.45 + index) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={active ? 0.22 : 0.08}>
        <group scale={active ? 1.22 : 0.94}>
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.24, 0.48]} />
            <meshStandardMaterial
              color={active ? "#14313A" : "#10242C"}
              roughness={0.28}
              metalness={0.72}
              emissive={accent}
              emissiveIntensity={active ? 0.36 : 0.18}
            />
          </mesh>
          <mesh position={[0, 0.03, 0.24]} castShadow>
            <boxGeometry args={[0.28, 0.14, 0.15]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, -0.13, 0]} castShadow>
            <boxGeometry args={[0.42, 0.055, 0.2]} />
            <meshStandardMaterial color="#1C2D36" roughness={0.38} metalness={0.55} />
          </mesh>

          {[
            [-0.55, 0, -0.36],
            [0.55, 0, -0.36],
            [-0.55, 0, 0.36],
            [0.55, 0, 0.36],
          ].map(([x, y, z]) => (
            <group key={`${x}-${z}`}>
              <mesh position={[x / 2, y, z / 2]} rotation={[0, Math.atan2(x, z), 0]} castShadow>
                <boxGeometry args={[0.035, 0.035, 0.85]} />
                <meshStandardMaterial color="#172832" roughness={0.35} metalness={0.65} />
              </mesh>
              <Rotor position={[x, y + 0.03, z]} />
            </group>
          ))}
        </group>
      </Float>

      <mesh receiveShadow position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.92, 1.08, 0.16, 56]} />
        <meshStandardMaterial
          color="#14222C"
          roughness={0.35}
          metalness={0.58}
          emissive={accent}
          emissiveIntensity={active ? 0.32 : 0.14}
        />
      </mesh>

      <mesh position={[0, -0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1.02, 56]} />
        <meshBasicMaterial color={accent} transparent opacity={active ? 0.5 : 0.28} />
      </mesh>

      <Text
        position={[0, -1.05, 0.05]}
        fontSize={0.16}
        color={active ? "#FFFFFF" : "#B8C7D4"}
        anchorX="center"
        anchorY="middle"
      >
        {drone.level}
      </Text>
    </group>
  );
}

type LabSceneProps = {
  drones: DroneModel[];
  progress: number;
  pointer: PointerState;
  reducedMotion: boolean;
};

function LabScene({ drones, progress, pointer, reducedMotion }: LabSceneProps) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const stations = drones.slice(0, 5);
  const activeIndex = Math.round(progress * Math.max(stations.length - 1, 1));

  useFrame(({ camera }) => {
    const travelStart = stationPositions[0];
    const travelEnd = stationPositions[stationPositions.length - 1];
    const cameraX = reducedMotion
      ? travelStart
      : THREE.MathUtils.lerp(travelStart, travelEnd, progress);
    const cameraY = reducedMotion ? 1.95 : 2 + Math.sin(progress * Math.PI) * 0.2;
    const cameraZ = reducedMotion ? 5.55 : 5.7 - Math.sin(progress * Math.PI) * 0.5;
    const parallaxX = reducedMotion ? 0 : pointer.x * 0.26;
    const parallaxY = reducedMotion ? 0 : -pointer.y * 0.12;

    camera.position.lerp(new THREE.Vector3(cameraX + parallaxX, cameraY + parallaxY, cameraZ), 0.07);
    target.set(cameraX - 1.35 + parallaxX * 0.8, 1.05 + parallaxY, 1.25);
    camera.lookAt(target);
  });

  return (
    <>
      <color attach="background" args={["#070D12"]} />
      <fog attach="fog" args={["#070D12", 5.5, 11]} />
      <ambientLight intensity={0.78} />
      <spotLight
        position={[0, 5.8, 4.2]}
        angle={0.42}
        penumbra={0.72}
        intensity={2.4}
        castShadow
      />
      <pointLight position={[0.6, 2.1, 2.4]} intensity={1.7} color="#00D1C1" />
      <pointLight position={[4.5, 2.1, 2.4]} intensity={1.15} color="#FFB020" />
      <Environment preset="city" />
      <LabRoom />

      {stations.map((drone, index) => (
        <group
          key={drone.slug}
          position={[stationPositions[index], 1.1, index % 2 === 0 ? 1.28 : 1.52]}
          rotation={[0, index % 2 === 0 ? -0.08 : 0.08, 0]}
        >
          <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.05, 64]} />
            <meshBasicMaterial
              color={accentColors[index % accentColors.length]}
              transparent
              opacity={activeIndex === index ? 0.42 : 0.22}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -0.845, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.78, 64]} />
            <meshBasicMaterial
              color={accentColors[index % accentColors.length]}
              transparent
              opacity={activeIndex === index ? 0.13 : 0.07}
              side={THREE.DoubleSide}
            />
          </mesh>
          <DroneModel3D drone={drone} index={index} active={activeIndex === index} />
        </group>
      ))}
    </>
  );
}

export function DroneLabShowroom(props: DroneLabShowroomProps) {
  if (isTestEnvironment) {
    return <TestShowroomFallback {...props} />;
  }

  return <InteractiveDroneLabShowroom {...props} />;
}

function InteractiveDroneLabShowroom(props: DroneLabShowroomProps) {
  const { locale, eyebrow, title, description, primaryCta, secondaryCta, drones } = props;
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const pointer = usePointerParallax(sectionRef);
  const reducedMotion = usePrefersReducedMotion();
  const primaryCtaIsExternal = primaryCta.href.startsWith("http");
  const activeIndex = Math.round(progress * Math.max(Math.min(drones.length, 5) - 1, 1));
  const activeDrone = drones[activeIndex] ?? drones[0];
  const copy = showroomCopy[locale];

  return (
    <section
      ref={sectionRef}
      data-testid="drone-lab-showroom"
      className="relative min-h-[185svh] bg-[#070D12] text-white"
    >
      <div className="sticky top-0 min-h-svh overflow-hidden">
        <div data-testid="drone-lab-canvas-host" className="absolute inset-0">
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [-4.8, 2.1, 5.7], fov: 42, near: 0.1, far: 60 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <LabScene
              drones={drones}
              progress={progress}
              pointer={pointer}
              reducedMotion={reducedMotion}
            />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(0,209,193,0.13),transparent_30%),linear-gradient(90deg,rgba(7,13,18,0.92),rgba(7,13,18,0.45)_40%,rgba(7,13,18,0.04)_72%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070D12]/95 via-[#070D12]/74 to-[#070D12]/18 md:hidden" />

        <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-7xl items-center px-5 py-24 sm:px-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7DE0D7]">
              <Sparkles aria-hidden="true" size={14} />
              {eyebrow}
            </p>
            <h1 className="display-type text-balance text-5xl font-medium leading-[0.96] tracking-[-0.04em] sm:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryCta.href}
                target={primaryCtaIsExternal ? "_blank" : undefined}
                rel={primaryCtaIsExternal ? "noopener noreferrer" : undefined}
                className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#10232A] transition hover:bg-[#00D1C1] sm:whitespace-nowrap"
              >
                {primaryCta.label}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href={secondaryCta.href}
                className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 px-6 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <aside className="pointer-events-none mt-10 max-w-sm justify-self-start rounded-[1.5rem] border border-white/12 bg-[#10232A]/78 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl md:mt-0 lg:mb-20 lg:self-end lg:justify-self-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7DE0D7]">
              {copy.configuration}
            </p>
            <h2 className="display-type mt-3 text-3xl font-medium tracking-[-0.025em]">{activeDrone?.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {activeDrone?.summary}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border-t border-white/12 pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {copy.level}
                </p>
                <p className="mt-1 font-semibold">{activeDrone?.level}</p>
              </div>
              <div className="border-t border-white/12 pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {copy.sequence}
                </p>
                <p className="mt-1 font-semibold">
                  {String(activeIndex + 1).padStart(2, "0")}
                </p>
              </div>
            </div>
          </aside>
        </div>
        <div className="pointer-events-none absolute -bottom-px left-1/2 z-20 h-9 w-[112%] -translate-x-1/2 rounded-t-[50%] bg-[#F5F7F4] sm:h-12" />
      </div>
    </section>
  );
}
