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
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sausageGroupRef = useRef<THREE.Group | null>(null);

  const sausageColor = 0xc14f0e;
  const sausageRadius = 0.4;
  const sausageLength = 6;
  const sausageSpacing = 1.5;

  const createSausageItem = useCallback((text: string, y: number): Promise<SausageItem> => {
    return new Promise((resolve) => {
      const sausageGeometry = new THREE.CapsuleGeometry(sausageRadius, sausageLength, 32, 16);
      const sausageMaterial = new THREE.MeshPhongMaterial({
        color: sausageColor,
        specular: 0x111111,
        shininess: 30,
      });
      const sausageMesh = new THREE.Mesh(sausageGeometry, sausageMaterial);
      sausageMesh.rotation.z = Math.PI / 2;

      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.3,
          height: 0.05,
          curveSegments: 12,
          bevelEnabled: false,
        });
        textGeometry.computeBoundingBox();
        textGeometry.center();
        
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 0, sausageRadius + 0.05);
        // Make text horizontal
        textMesh.rotation.x = Math.PI / 10;

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

    // Create main sausage
    createSausageItem("Menu", 0).then((mainSausageItem) => {
      sausageGroup.add(mainSausageItem);
    });

    // Create dropdown sausages
    items.forEach((item, index) => {
      const y = -(index + 1) * sausageSpacing;
      createSausageItem(item.label, y).then((sausageItem) => {
        sausageItem.visible = false;
        sausageGroup.add(sausageItem);
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
  }, [width, height, items, createSausageItem]);

  const animateDropdown = useCallback((open: boolean) => {
    if (!sausageGroupRef.current) return;

    const duration = 500;
    const startTime = Date.now();

    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      sausageGroupRef.current?.children.forEach((child, index) => {
        if (index > 0) { // Skip main sausage
          const targetY = open ? -(index) * sausageSpacing : 0;
          const currentY = open ? 0 : -(index) * sausageSpacing;
          child.position.y = THREE.MathUtils.lerp(currentY, targetY, easedProgress);
          child.visible = open || progress < 1;
          
          if (child instanceof THREE.Group) {
            child.scale.set(1, easedProgress, 1);
          }
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

    const sausageItem = sausageGroupRef.current.children[index + 1] as SausageItem;
    if (sausageItem && sausageItem.sausageMesh) {
      (sausageItem.sausageMesh.material as THREE.MeshPhongMaterial).color.setHex(isHovering ? 0xff9933 : sausageColor);
    }
  }, []);

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