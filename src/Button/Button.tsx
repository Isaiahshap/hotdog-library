// Button.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import TWEEN from '@tweenjs/tween.js';
import './Button.css';

interface SausageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number;
  height?: number;
  condiment?: 'ketchup' | 'mustard' | 'mayo';
  children?: React.ReactNode;
}

const SausageButton: React.FC<SausageButtonProps> = ({ 
  width = 400, 
  height =120, 
  condiment = 'ketchup', 
  children,
  ...props 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sausageGroupRef = useRef<THREE.Group | null>(null);

  const createSausageButton = useCallback((text: string): Promise<THREE.Group> => {
    return new Promise((resolve) => {
      const sausageGroup = new THREE.Group();
      const sausageRadius = 0.2;
      const sausageLength = 1.5;
      const bodyGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 32, 32);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc14f0e,
        metalness: 0.3,
        roughness: 0.7,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.z = Math.PI / 2;
      sausageGroup.add(body);

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.15,
          height: 0.04,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.005,
          bevelOffset: 0,
          bevelSegments: 5
        });
        textGeometry.computeBoundingBox();
        textGeometry.center();
        
        const condimentColors = {
          ketchup: 0xff0000,
          mustard: 0xffdb58,
          mayo: 0xfffdd0,
        };
        const textMaterial = new THREE.MeshPhongMaterial({ color: condimentColors[condiment] });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        textMesh.position.set(0, 0, sausageRadius + 0.05);
        sausageGroup.add(textMesh);

        resolve(sausageGroup);
      });
    });
  }, [condiment]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 2;

    createSausageButton(children?.toString() || '').then((sausageGroup) => {
      scene.add(sausageGroup);
      sausageGroupRef.current = sausageGroup;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const handleMouseEnter = () => {
      if (sausageGroupRef.current) {
        new TWEEN.Tween(sausageGroupRef.current.scale)
          .to({ x: 1.1, y: 1.1, z: 1.1 }, 200)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
    };

    const handleMouseLeave = () => {
      if (sausageGroupRef.current) {
        new TWEEN.Tween(sausageGroupRef.current.scale)
          .to({ x: 1, y: 1, z: 1 }, 200)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
    };

    mountRef.current.addEventListener('mouseenter', handleMouseEnter);
    mountRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      mountRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      mountRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height, children, createSausageButton]);

  return (
    <button
      {...props}
      className={`sausage-button ${props.className || ''}`}
    >
      <div ref={mountRef} className="sausage-3d" style={{ width: `${width}px`, height: `${height}px` }} />
    </button>
  );
};

export default SausageButton;