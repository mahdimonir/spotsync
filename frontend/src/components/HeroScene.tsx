"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SceneOptions {
  onHover?: (name: string | null) => void;
}

export default function HeroScene({ onHover }: SceneOptions) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    /* ── Scene ── */
    const scene = new THREE.Scene();
    scene.background = null; // transparent — CSS background shows through

    /* ── Camera ── */
    const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
    cam.position.set(0, 0, 9);

    /* ── Lights ── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd6ffe8, 0.8);
    fill.position.set(-6, -4, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc7d2fe, 1.0);
    rim.position.set(0, -6, -5);
    scene.add(rim);

    /* ── Materials ── */
    const matSilver = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      metalness: 0.95,
      roughness: 0.08,
      envMapIntensity: 1.0,
    });

    const matGreen = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.7,
      roughness: 0.12,
      emissive: 0x022c22,
      emissiveIntensity: 0.3,
    });

    const matDark = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.9,
      roughness: 0.06,
    });

    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.95,
      thickness: 0.5,
      transparent: true,
      opacity: 0.4,
      ior: 1.5,
    });

    /* ── Main central icosahedron (Apple-style rotating gem) ── */
    const mainGeo = new THREE.IcosahedronGeometry(1.45, 1);
    const mainMesh = new THREE.Mesh(mainGeo, matDark);
    mainMesh.castShadow = true;
    mainMesh.position.set(0.3, 0, 0);
    scene.add(mainMesh);

    /* Wireframe overlay */
    const wireGeo = new THREE.IcosahedronGeometry(1.47, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mainMesh.add(wireMesh);

    /* ── Floating ring around main object ── */
    const torusGeo = new THREE.TorusGeometry(2.2, 0.04, 12, 100);
    const torus = new THREE.Mesh(torusGeo, matGreen);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    /* ── Orbital parking spheres ── */
    const spotData = [
      { label: "EV Bay A1", available: true,  angle: 0 },
      { label: "Bay A2",    available: false, angle: (Math.PI * 2) / 5 },
      { label: "EV Bay A3", available: true,  angle: (Math.PI * 4) / 5 },
      { label: "Bay A4",    available: false, angle: (Math.PI * 6) / 5 },
      { label: "EV Bay A5", available: true,  angle: (Math.PI * 8) / 5 },
    ];

    const spotMeshes: THREE.Mesh[] = [];
    spotData.forEach(({ label, available, angle }) => {
      const r = 2.2;
      const geo = new THREE.SphereGeometry(0.16, 24, 24);
      const mat = available
        ? matGreen.clone()
        : new THREE.MeshStandardMaterial({ color: 0xcc3333, metalness: 0.5, roughness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        Math.cos(angle) * r,
        Math.sin(angle) * r * 0.58,
        0
      );
      mesh.name = label;
      mesh.userData = { available, originalScale: 1 };
      torus.add(mesh);
      spotMeshes.push(mesh);
    });

    /* ── Small floating accent gems ── */
    const accents: THREE.Mesh[] = [];
    const accentPositions = [
      [-3.2, 1.8, -1.0],
      [ 3.0, -1.6, -0.5],
      [-2.4, -2.2,  0.5],
      [ 2.8,  2.0, -1.2],
      [-1.0,  2.8, -0.8],
    ];
    accentPositions.forEach(([x, y, z]) => {
      const geo = new THREE.OctahedronGeometry(0.22, 0);
      const mesh = new THREE.Mesh(geo, matSilver);
      mesh.position.set(x, y, z);
      mesh.userData = { baseY: y };
      scene.add(mesh);
      accents.push(mesh);
    });

    /* ── Soft ground disc for depth ── */
    const discGeo = new THREE.CircleGeometry(4, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.0,
      roughness: 1.0,
      transparent: true,
      opacity: 0.18,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -2.4;
    scene.add(disc);

    /* ── Mouse tracking ── */
    let mx = 0, my = 0;
    let targetMX = 0, targetMY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

      /* Raycasting for hover spot labels */
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2(mx, -my);
      raycaster.setFromCamera(ndc, cam);
      const worldSpots = spotMeshes.map(s => {
        const world = new THREE.Vector3();
        s.getWorldPosition(world);
        return world;
      });
      const hits = raycaster.intersectObjects(spotMeshes, false);
      if (hits.length > 0) {
        onHover?.(hits[0].object.name);
        el.style.cursor = "pointer";
        spotMeshes.forEach(s => {
          s.scale.setScalar(s === hits[0].object ? 1.6 : 1.0);
        });
      } else {
        onHover?.(null);
        el.style.cursor = "default";
        spotMeshes.forEach(s => s.scale.setScalar(1.0));
      }
    };

    /* ── Scroll binding ── */
    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    let raf: number;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const scrollFrac = scrollY / (window.innerHeight || 1);

      /* Smooth camera mouse parallax */
      targetMX += (mx - targetMX) * 0.04;
      targetMY += (my - targetMY) * 0.04;

      cam.position.x = targetMX * 1.2;
      cam.position.y = -targetMY * 0.8;
      cam.lookAt(0.3, 0, 0);

      /* Central gem auto-rotation */
      mainMesh.rotation.y = t * 0.18 + scrollFrac * Math.PI * 0.5;
      mainMesh.rotation.x = t * 0.07;

      /* Ring tilt on scroll */
      torus.rotation.y = t * 0.12 + scrollFrac * 1.4;
      torus.rotation.x = Math.PI / 3 + scrollFrac * 0.4;

      /* Accent gem float */
      accents.forEach((gem, i) => {
        gem.rotation.y = t * 0.4 + i;
        gem.rotation.x = t * 0.3 + i * 0.7;
        gem.position.y = (gem.userData.baseY as number) + Math.sin(t * 0.6 + i * 1.2) * 0.18;
      });

      renderer.render(scene, cam);
    };
    tick();

    /* ── Resize ── */
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onHover]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
