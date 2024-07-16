import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import TWEEN from '@tweenjs/tween.js';
import './Dropdown.css';

interface MenuItem {
  label: string;
  value: string;
}

interface SausageDropdownProps {
  items: MenuItem[];
  onSelect: (value: string) => void;
  width?: number;
  height?: number;
}

interface SausageItem extends THREE.Group {
  sausageMesh: THREE.Mesh;
  textMesh: THREE.Mesh;
}

const SausageDropdown: React.FC<SausageDropdownProps> = ({
  items,
  onSelect,
  width = 800,
  height = 400
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sausageGroupRef = useRef<THREE.Group | null>(null);

  const sausageColor = 0xc14f0e;
  const sausageRadius = 0.4;
  const sausageLength = 6;
  const sausageSpacing = 1.5;

  const createSausageItem = useCallback((text: string, y: number): Promise<SausageItem> => {
    return new Promise((resolve) => {
      const sausageGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 32, 16);
      const sausageMaterial = new THREE.MeshPhysicalMaterial({
        color: sausageColor,
        metalness: 0.3,
        roughness: 0.7,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
      });
      const sausageMesh = new THREE.Mesh(sausageGeometry, sausageMaterial);
      sausageMesh.rotation.z = Math.PI / 2;

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
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
        
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        textMesh.position.set(0, 0, sausageRadius + 0.05);

        const sausageItem = new THREE.Group() as SausageItem;
        sausageItem.add(sausageMesh);
        sausageItem.add(textMesh);
        sausageItem.sausageMesh = sausageMesh;
        sausageItem.textMesh = textMesh;
        sausageItem.position.y = y;

        resolve(sausageItem);
      });
    });
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const aspect = width / height;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2, 
      frustumSize * aspect / 2, 
      frustumSize / 2, 
      frustumSize / -2, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const totalHeight = (items.length + 1) * sausageSpacing;
    camera.position.z = 10;
    camera.lookAt(scene.position);

    const sausageGroup = new THREE.Group();
    sausageGroup.position.y = totalHeight / 2 - sausageSpacing / 2;
    scene.add(sausageGroup);

    createSausageItem("Menu", 0).then((mainSausageItem) => {
      sausageGroup.add(mainSausageItem);
    });

    items.forEach((item, index) => {
      const y = -(index + 1) * sausageSpacing;
      createSausageItem(item.label, y).then((sausageItem) => {
        sausageItem.visible = false;
        sausageGroup.add(sausageItem);
      });
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
    sausageGroupRef.current = sausageGroup;

    const handleMouseMove = (event: MouseEvent) => {
      if (!sausageGroupRef.current) return;

      const rect = mountRef.current!.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / width) * 2 - 1;

      sausageGroupRef.current.children.forEach((child) => {
        child.rotation.y = mouseX * 0.3;
      });
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [width, height, items, createSausageItem, sausageSpacing]);

  const animateDropdown = useCallback((open: boolean) => {
    if (!sausageGroupRef.current) return;

    const totalHeight = (items.length + 1) * sausageSpacing;
    const targetY = open ? totalHeight / 2 - sausageSpacing / 2 : 0;

    new TWEEN.Tween(sausageGroupRef.current.position)
      .to({ y: targetY }, 500)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    sausageGroupRef.current.children.forEach((child, index) => {
      if (index > 0) {
        const targetScale = open ? 1 : 0;
        const targetVisibility = open;

        new TWEEN.Tween(child.scale)
          .to({ x: targetScale, y: targetScale, z: targetScale }, 500)
          .easing(TWEEN.Easing.Back.Out)
          .start();

        new TWEEN.Tween({ opacity: child.visible ? 1 : 0 })
          .to({ opacity: targetVisibility ? 1 : 0 }, 500)
          .onUpdate((obj: { opacity: number }) => {
            child.visible = obj.opacity > 0;
          })
          .start();
      }
    });
  }, [items, sausageSpacing]);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      animateDropdown(newIsOpen);
      return newIsOpen;
    });
  }, [animateDropdown]);

  const handleSelect = useCallback((index: number) => {
    const selectedItem = items[index];
    if (selectedItem) {
      onSelect(selectedItem.value);
      setIsOpen(false);
      animateDropdown(false);
    }
  }, [items, onSelect, animateDropdown]);

  return (
    <div 
      ref={mountRef} 
      className="sausage-dropdown"
      onClick={handleClick}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default SausageDropdown;