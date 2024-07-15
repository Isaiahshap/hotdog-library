// Button.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import './Button.css';

interface SausageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number;
  height?: number;
  condiment?: 'ketchup' | 'mustard' | 'mayo';
  children?: React.ReactNode;
}

const SausageButton: React.FC<SausageButtonProps> = ({ 
  width = 600, 
  height = 400, 
  condiment = 'ketchup', 
  children,
  ...props 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

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

    const sausageGroup = new THREE.Group();
    const sausageRadius = 0.5;
    const sausageLength = 3;
    const bodyGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xc14f0e,
      roughness: 0.7,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    sausageGroup.add(body);

    // Add this line to rotate the sausage group 90 degrees around the X-axis
    sausageGroup.rotation.x = -Math.PI * 1.45;

    scene.add(sausageGroup);

    camera.position.z = 5;

    const condimentColors = {
      ketchup: 0xff0000,
      mustard: 0xffdb58,
      mayo: 0xfffdd0,
    };

    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/gentilis_regular.typeface.json', (font) => {
      const text = children?.toString() || '';
      const textLength = text.length;
      const maxTextWidth = sausageLength * 1; // 80% of sausage length
      const minSpacing = -0.05;
      const maxSpacing = 0.5;
      
      // Calculate ideal spacing
      let spacing = (maxTextWidth - (textLength * 0.3)) / (textLength - 1);
      spacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));

      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.3,
        height: 0.08,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5
      });

      const textMaterial = new THREE.MeshStandardMaterial({ 
        color: condimentColors[condiment],
        roughness: 0.6,
        metalness: 0.1
      });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x;
      
      // Adjust text position
      const rightShift = 0.2;
      textMesh.position.set(-textWidth / 2 + rightShift, sausageRadius, 0);
      textMesh.rotation.x = -Math.PI / 2;
      textMesh.rotation.y = 0;

      // Apply spacing and curve to the text
      const positionAttribute = textGeometry.getAttribute('position');
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        // Apply spacing
        const charIndex = Math.floor(x / 1); // Assuming each character is roughly 0.3 units wide
        const newX = x + (charIndex * spacing);
        
        // Apply curve
        const newY = y + Math.sin(newX * 9) * 0.06;
        
        positionAttribute.setX(i, newX);
        positionAttribute.setY(i, newY);
      }
      positionAttribute.needsUpdate = true;

      sausageGroup.add(textMesh);
    });

    let rotationSpeed = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      rotationSpeed = isHovering ? 0.05 : Math.max(0, rotationSpeed - 0.001);
      sausageGroup.rotation.x += rotationSpeed;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height, isHovering, condiment, children]);

  return (
    <button
      {...props}
      className={`sausage-button ${props.className || ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div ref={mountRef} className="sausage-3d" />
    </button>
  );
};

export default SausageButton;