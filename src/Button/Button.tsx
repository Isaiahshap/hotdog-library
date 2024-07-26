// Button.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import TWEEN from '@tweenjs/tween.js';
import './Button.css';

interface SausageButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  width?: number;
  height?: number;
  condiment?: 'ketchup' | 'mustard' | 'mayo';
  children?: React.ReactNode;
  ariaLabel?: string;
  fontSize?: number;
  fontColor?: string;
  disabledColor?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

const SausageButton: React.FC<SausageButtonProps> = ({ 
  width = 400, 
  height = 120, 
  condiment = 'ketchup', 
  children,
  ariaLabel,
  fontSize = 0.15,
  fontColor = '#ffffff',
  disabledColor = '#888888',
  onClick,
  disabled = false,
  ...props 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sausageGroupRef = useRef<THREE.Group | null>(null);
  const textMeshRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fontRef = useRef<Font | null>(null);

  const createSausageButton = useCallback((text: string): Promise<THREE.Group> => {
    return new Promise((resolve) => {
      const sausageGroup = new THREE.Group();
      const sausageRadius = 0.3;
      const sausageLength = 2;
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
        fontRef.current = font;
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: fontSize,
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
        const textMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(fontColor) });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        textMesh.position.set(0, 0, sausageRadius + 0.05);
        sausageGroup.add(textMesh);
        textMeshRef.current = textMesh;

        resolve(sausageGroup);
      });
    });
  }, [condiment, fontSize, fontColor]);

  const updateTextMesh = useCallback((text: string) => {
    if (textMeshRef.current && fontRef.current) {
      const newTextGeometry = new TextGeometry(text, {
        font: fontRef.current,
        size: fontSize,
        height: 0.04,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 5
      });
      newTextGeometry.computeBoundingBox();
      newTextGeometry.center();

      textMeshRef.current.geometry.dispose();
      textMeshRef.current.geometry = newTextGeometry;
    }
  }, [fontSize]);

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

    camera.position.z = 2.5;

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

    const handleMouseMove = (event: MouseEvent) => {
      if (sausageGroupRef.current && mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = (event.clientX - centerX) / (window.innerWidth / 2);
        const mouseY = -(event.clientY - centerY) / (window.innerHeight / 2);

        const maxRotation = 0.2; // Maximum rotation in radians

        const targetRotationX = mouseY * maxRotation;
        const targetRotationY = mouseX * maxRotation;

        sausageGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          sausageGroupRef.current.rotation.x,
          targetRotationX,
          0.1
        );
        sausageGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          sausageGroupRef.current.rotation.y,
          targetRotationY,
          0.1
        );

        // Check if mouse is over sausage
        const localMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const localMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const mouse = new THREE.Vector2(localMouseX, localMouseY);
        raycasterRef.current.setFromCamera(mouse, camera);
        const intersects = raycasterRef.current.intersectObjects(sausageGroupRef.current.children, true);
        setIsHovered(intersects.length > 0);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [width, height, children, createSausageButton]);

  useEffect(() => {
    if (sausageGroupRef.current) {
      new TWEEN.Tween(sausageGroupRef.current.scale)
        .to({ x: isFocused ? 1.1 : 1, y: isFocused ? 1.1 : 1, z: isFocused ? 1.1 : 1 }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    }
  }, [isFocused]);

  useEffect(() => {
    updateTextMesh(children?.toString() || '');
  }, [children, updateTextMesh]);

  useEffect(() => {
    if (sausageGroupRef.current) {
      sausageGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshPhongMaterial) {
            child.material.color.set(disabled ? disabledColor : fontColor);
          }
        }
      });
    }
  }, [disabled, disabledColor, fontColor]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (sausageGroupRef.current && cameraRef.current && mountRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const mouse = new THREE.Vector2(mouseX, mouseY);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);

      const intersects = raycasterRef.current.intersectObjects(sausageGroupRef.current.children, true);

      if (intersects.length > 0 && !disabled) {
        onClick && onClick(event);
      }
    }
  }, [onClick, disabled]);

  return (
    <div
      className={`sausage-button ${props.className || ''} ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      aria-label={ariaLabel || children?.toString()}
      style={{ cursor: isHovered && !disabled ? 'pointer' : 'default' }}
      {...props}
    >
      <div ref={mountRef} className="sausage-3d" style={{ width: `${width}px`, height: `${height}px` }} />
    </div>
  );
};

export default SausageButton;