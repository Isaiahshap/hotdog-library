// Background.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Background: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Grill base
    const baseGeometry = new THREE.CircleGeometry(2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = -Math.PI / 2;
    scene.add(base);

    // Charcoal
    const charcoalGroup = new THREE.Group();
    for (let i = 0; i < 100; i++) {
      const charcoalGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      charcoalGeometry.scale(1, 0.5, 1);
      const charcoalMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: 0xff4400,
        emissiveIntensity: Math.random() * 0.5 + 0.5,
      });
      const charcoal = new THREE.Mesh(charcoalGeometry, charcoalMaterial);
      charcoal.position.set(
        (Math.random() - 0.5) * 3.5,
        0.1,
        (Math.random() - 0.5) * 3.5
      );
      charcoal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      charcoalGroup.add(charcoal);
    }
    scene.add(charcoalGroup);

    // Grate
    const grateGroup = new THREE.Group();
    const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 4, 8);
    const grateMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    for (let i = -1.8; i <= 1.8; i += 0.4) {
      const bar1 = new THREE.Mesh(barGeometry, grateMaterial);
      bar1.position.set(i, 0.2, 0);
      bar1.rotation.x = Math.PI / 2;
      grateGroup.add(bar1);

      const bar2 = new THREE.Mesh(barGeometry, grateMaterial);
      bar2.position.set(0, 0.2, i);
      bar2.rotation.z = Math.PI / 2;
      grateGroup.add(bar2);
    }
    scene.add(grateGroup);

    // Camera position
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate charcoal glow
      charcoalGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const charcoal = child as THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
          charcoal.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005 + charcoal.position.x * 10) * 0.2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = 4;
      camera.left = -frustumSize * aspect / 2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Background;