import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
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

const SausageDropdown: React.FC<SausageDropdownProps> = ({
  items,
  onSelect,
  width = 800,
  height = 400
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sausageGroupRef = useRef<THREE.Group | null>(null);

  const sausageColor = 0xc14f0e;
  const sausageRadius = 0.4;
  const sausageLength = 6;
  const sausageSpacing = 1.2;

  const createSausage = useCallback((y: number) => {
    const sausageGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 16, 16);
    const sausageMaterial = new THREE.MeshStandardMaterial({
      color: sausageColor,
      roughness: 0.7,
      metalness: 0.1,
    });
    const sausage = new THREE.Mesh(sausageGeometry, sausageMaterial);
    sausage.rotation.z = Math.PI / 2;
    sausage.position.y = y;
    return sausage;
  }, []);

  const createText = useCallback((text: string, y: number) => {
    return new Promise<THREE.Mesh>((resolve) => {
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.4,
          height: 0.05,
        });
        textGeometry.center();
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, y, sausageRadius + 0.1);
        resolve(textMesh);
      });
    });
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 8;

    const sausageGroup = new THREE.Group();
    scene.add(sausageGroup);

    // Create main sausage and text
    const mainSausage = createSausage(0);
    sausageGroup.add(mainSausage);
    createText("Menu", 0).then((textMesh) => {
      sausageGroup.add(textMesh);
    });

    // Create dropdown sausages and text
    items.forEach((item, index) => {
      const y = -(index + 1) * sausageSpacing;
      
      // Create sausage
      const dropdownSausage = createSausage(y);
      dropdownSausage.visible = false;
      sausageGroup.add(dropdownSausage);

      // Create text on the sausage
      createText(item.label, y).then((textMesh) => {
        textMesh.visible = false;
        sausageGroup.add(textMesh);
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    sausageGroupRef.current = sausageGroup;

    const handleMouseMove = (event: MouseEvent) => {
      if (!sausageGroupRef.current) return;

      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      sausageGroupRef.current.position.x = mouseX * 2;
      sausageGroupRef.current.position.y = mouseY * 2;
      sausageGroupRef.current.rotation.x = mouseY * 0.2;
      sausageGroupRef.current.rotation.y = mouseX * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [width, height, items, createSausage, createText]);

  const animateDropdown = useCallback((open: boolean) => {
    if (!sausageGroupRef.current) return;

    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      sausageGroupRef.current?.children.forEach((child, index) => {
        if (index > 1) { // Skip main sausage and its text
          const targetY = open ? -Math.floor((index - 1) / 2) * sausageSpacing : 0;
          child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, progress);
          child.visible = open;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [sausageSpacing]);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      animateDropdown(newIsOpen);
      return newIsOpen;
    });
  }, [animateDropdown]);

  const handleHover = useCallback((index: number, isHovering: boolean) => {
    if (!sausageGroupRef.current) return;

    const sausage = sausageGroupRef.current.children[index * 2 + 1];
    if (sausage instanceof THREE.Mesh) {
      (sausage.material as THREE.MeshStandardMaterial).color.setHex(isHovering ? 0xff9933 : sausageColor);
    }
  }, []);

  const handleSelect = useCallback((index: number) => {
    onSelect(items[index].value);
    setIsOpen(false);
    animateDropdown(false);
  }, [items, onSelect, animateDropdown]);

  return (
    <div 
      ref={mountRef} 
      className="sausage-dropdown"
      onClick={handleClick}
      onMouseMove={(e) => {
        if (isOpen && mountRef.current) {
          const rect = mountRef.current.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const index = Math.floor((y / height) * items.length);
          handleHover(index, true);
        }
      }}
      onMouseLeave={() => {
        if (isOpen && sausageGroupRef.current) {
          items.forEach((_, index) => {
            handleHover(index, false);
          });
        }
      }}
    />
  );
};

export default SausageDropdown;