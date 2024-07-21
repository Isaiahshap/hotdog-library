// Navbar.tsx
import React, { useRef, useEffect, ReactNode } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import './Navbar.css';

interface NavbarProps {
  title: string;
  textColor?: string;
  fontUrl?: string;
  children?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  textColor = '#ffffff', 
  fontUrl = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
  children
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / 80;
    const camera = new THREE.OrthographicCamera(-aspect / 2, aspect / 2, 0.5, -0.5, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, 80);
    mountRef.current.appendChild(renderer.domElement);

    const sausageRadius = 0.4;
    const sausageLength = aspect;
    const sausageGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 32, 32);
    const sausageMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc14f0e,
      metalness: 0.3,
      roughness: 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });
    const sausage = new THREE.Mesh(sausageGeometry, sausageMaterial);
    sausage.rotation.z = Math.PI / 2;
    scene.add(sausage);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    const loader = new FontLoader();
    loader.load(fontUrl, (font) => {
      const textGeometry = new TextGeometry(title, {
        font: font,
        size: 0.35,
        height: 0.08,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
      });
      textGeometry.computeBoundingBox();
      textGeometry.center();
      
      const textMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(textColor) });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      
      textMesh.position.set(0, 0, sausageRadius + 0.05);
      scene.add(textMesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const newAspect = window.innerWidth / 80;
      camera.left = -newAspect / 2;
      camera.right = newAspect / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 80);
      sausage.scale.x = newAspect / sausageLength;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [title, textColor, fontUrl]);

  return (
    <nav className="sausage-navbar">
      <div ref={mountRef} className="sausage-3d-container"></div>
      <div className="navbar-content">
        {children}
      </div>
    </nav>
  );
};

export default Navbar;