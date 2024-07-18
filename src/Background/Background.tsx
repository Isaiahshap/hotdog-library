// Background.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Background: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sausageRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Grill base
    const baseGeometry = new THREE.PlaneGeometry(4, 4);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = -Math.PI / 2;
    scene.add(base);

    // Charcoal
    const charcoalGroup = new THREE.Group();
    const charcoalCount = 2000;
    const charcoalGeometry = new THREE.DodecahedronGeometry(0.05);
    
    for (let i = 0; i < charcoalCount; i++) {
      const charcoalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x222222).lerp(new THREE.Color(0x444444), Math.random()),
        emissive: new THREE.Color(0xff4400).lerp(new THREE.Color(0xff8800), Math.random()),
        emissiveIntensity: Math.random() * 0.5,
        roughness: 0.9,
      });
      const charcoal = new THREE.Mesh(charcoalGeometry, charcoalMaterial);
      charcoal.position.set(
        (Math.random() - 0.5) * 3.8,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 3.8
      );
      charcoal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      charcoal.scale.setScalar(0.5 + Math.random() * 0.5);
      charcoalGroup.add(charcoal);
    }
    scene.add(charcoalGroup);

    // Grate
    const grateGroup = new THREE.Group();
    const grateCount = 20;
    const grateSpacing = 4 / (grateCount - 1);
    const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 4, 16);
    const grateMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.8,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
    });

    for (let i = 0; i < grateCount; i++) {
      const bar = new THREE.Mesh(barGeometry, grateMaterial);
      bar.position.set(0, 0.15, -2 + i * grateSpacing);
      bar.rotation.z = Math.PI / 2;
      grateGroup.add(bar);
    }
    scene.add(grateGroup);

    // Sausage
    const sausageGeometry = new THREE.CapsuleGeometry(0.1, 1, 32, 32);
    const sausageMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc14f0e,
      metalness: 0.3,
      roughness: 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });
    const sausage = new THREE.Mesh(sausageGeometry, sausageMaterial);
    sausage.rotation.z = Math.PI / 2;  // Lay the sausage flat
    sausage.position.set(0, 0.25, 0);  // Position it just above the grates
    scene.add(sausage);
    sausageRef.current = sausage;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const fireLightCount = 20;
    const fireLights: THREE.PointLight[] = [];
    for (let i = 0; i < fireLightCount; i++) {
      const fireLight = new THREE.PointLight(0xff6600, 0.3, 1);
      fireLight.position.set((Math.random() - 0.5) * 4, 0.1, (Math.random() - 0.5) * 4);
      scene.add(fireLight);
      fireLights.push(fireLight);
    }

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // Camera position
    camera.position.set(0, 1.5, 1.5);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate charcoal glow
      charcoalGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = Math.max(0, Math.min(0.5, child.material.emissiveIntensity + (Math.random() - 0.5) * 0.05));
        }
      });

      // Animate fire lights
      fireLights.forEach((light) => {
        light.intensity = Math.max(0.1, Math.min(0.5, light.intensity + (Math.random() - 0.5) * 0.1));
      });

      // Animate grate glow
      grateGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = Math.max(0.1, Math.min(0.3, child.material.emissiveIntensity + (Math.random() - 0.5) * 0.02));
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Handle mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      if (!sausageRef.current) return;

      const rect = mountRef.current!.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObject(base);

      if (intersects.length > 0) {
        const targetPosition = intersects[0].point;
        const sausage = sausageRef.current;

        // Clamp the target position to the grill boundaries
        targetPosition.x = Math.max(-1.9, Math.min(1.9, targetPosition.x));
        targetPosition.z = Math.max(-1.9, Math.min(1.9, targetPosition.z));

        // Move sausage towards mouse position, keeping it above the grates
        sausage.position.x += (targetPosition.x - sausage.position.x) * 0.1;
        sausage.position.z += (targetPosition.z - sausage.position.z) * 0.1;
        sausage.position.y = 0.25;  // Keep it at a constant height above the grates

        // Rotate the sausage to face the direction of movement
        const angle = Math.atan2(targetPosition.x - sausage.position.x, targetPosition.z - sausage.position.z);
        sausage.rotation.y = angle;
      }
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default Background;