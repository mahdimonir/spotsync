"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCanvasProps {
  onHoverSpot?: (spotName: string | null) => void;
}

export default function ThreeCanvas({ onHoverSpot }: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup (Light Theme Background)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7); // Apple-like off-white background
    scene.fog = new THREE.FogExp2(0xf5f5f7, 0.002);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 70, 160);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights (High-end studio light mapping)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(50, 120, 50);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5f3fc, 0.5); // Soft cyan secondary rim light
    dirLight2.position.set(-50, -50, 50);
    scene.add(dirLight2);

    // 5. Creating the Central Torus Loop (Silver Brushed Steel Ring)
    const ringGeom = new THREE.TorusGeometry(38, 1.8, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Silver slate
      metalness: 0.9,
      roughness: 0.15,
    });
    const mainRing = new THREE.Mesh(ringGeom, ringMat);
    mainRing.rotation.x = Math.PI / 2; // Lie flat
    scene.add(mainRing);

    // 6. Creating Parking Spots (Glossy Spheres around the ring)
    const spotsCount = 5;
    const spotRadius = 38;
    const spheres: THREE.Mesh[] = [];

    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Ruby Red
      metalness: 0.3,
      roughness: 0.2,
      emissive: 0x991b1b,
      emissiveIntensity: 0.15,
    });

    const greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald Green
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0x065f46,
      emissiveIntensity: 0.4,
    });

    const spotNames = ["Spot A1", "Spot A2", "Spot A3", "Spot A4", "Spot A5 (EV)"];

    for (let i = 0; i < spotsCount; i++) {
      const angle = (i / spotsCount) * Math.PI * 2;
      const sphereGeom = new THREE.SphereGeometry(3.8, 32, 32);
      
      const isAvailable = (i === 4); // Spot 5 is free
      const material = isAvailable ? greenMaterial : redMaterial;
      const sphere = new THREE.Mesh(sphereGeom, material);

      // Set position circularly
      sphere.position.x = Math.cos(angle) * spotRadius;
      sphere.position.z = Math.sin(angle) * spotRadius;
      sphere.position.y = 0;

      sphere.name = spotNames[i];
      // Attach metadata for raycasting
      sphere.userData = { index: i, angle, originalScale: 1.0, isAvailable };

      mainRing.add(sphere);
      spheres.push(sphere);
    }

    // 7. Event Handlers
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Calculate normalized mouse coords for raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Camera parallax target
      mouseX = (event.clientX - window.innerWidth / 2) * 0.02;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.02;

      // Raycaster detection
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(spheres);

      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object as THREE.Mesh;
        document.body.style.cursor = "pointer";

        if (onHoverSpot) {
          onHoverSpot(hoveredObject.name);
        }

        // Scale up hovered sphere
        spheres.forEach((s) => {
          if (s === hoveredObject) {
            s.scale.set(1.25, 1.25, 1.25);
          } else {
            s.scale.set(1.0, 1.0, 1.0);
          }
        });
      } else {
        document.body.style.cursor = "default";
        if (onHoverSpot) {
          onHoverSpot(null);
        }
        spheres.forEach((s) => s.scale.set(1.0, 1.0, 1.0));
      }
    };

    // Scroll listener rotates the ring!
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // 8. Animation loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Gentle floating sine motion
      mainRing.position.y = Math.sin(elapsed * 0.8) * 3;
      
      // Auto-rotation around its flat axis
      mainRing.rotation.z = elapsed * 0.06 + (scrollY * 0.004);

      // Camera smooth target mapping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.2;
      camera.position.y = 70 - targetY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ringGeom.dispose();
      ringMat.dispose();
      redMaterial.dispose();
      greenMaterial.dispose();
      spheres.forEach((s) => s.geometry.dispose());
      renderer.dispose();
    };
  }, [onHoverSpot]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-[#f5f5f7] overflow-hidden -z-10"
    />
  );
}
