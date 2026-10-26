import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Book } from '../utils/journalLogic';

interface Atelier3DSceneProps {
  cameraMode: 'intro' | 'writing' | 'diary' | 'bookshelf';
  currentDraft: string;
  carriageRatio: number; // 0 to 1
  lineRatio: number; // 0 to 1
  activeKeyChar: string | null;
  isArchiving: boolean;
  archiveProgress: number; // 0 to 1
  activeBook: Book | null;
  onTypewriterClick?: () => void;
  onDiaryClick?: () => void;
}

export const Atelier3DScene: React.FC<Atelier3DSceneProps> = ({
  cameraMode,
  carriageRatio,
  lineRatio,
  activeKeyChar,
  isArchiving,
  archiveProgress,
  activeBook,
  onTypewriterClick,
  onDiaryClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carriageGroupRef = useRef<THREE.Group | null>(null);
  const typebarRef = useRef<THREE.Mesh | null>(null);
  const paperMeshRef = useRef<THREE.Mesh | null>(null);
  const flyingPaperRef = useRef<THREE.Mesh | null>(null);
  const diaryCoverRef = useRef<THREE.Group | null>(null);
  const keyMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const lampLightRef = useRef<THREE.PointLight | null>(null);

  // Target camera positions
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 4.5, 7.5));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));

  // Update camera targets based on cameraMode
  useEffect(() => {
    switch (cameraMode) {
      case 'intro':
        targetCamPos.current.set(1.5, 3.8, 9.2);
        targetCamLook.current.set(-0.2, 1.0, 0);
        break;
      case 'writing':
        targetCamPos.current.set(0, 3.4, 4.2);
        targetCamLook.current.set(0, 1.35, -0.2);
        break;
      case 'diary':
        targetCamPos.current.set(2.4, 3.8, 3.8);
        targetCamLook.current.set(2.0, 1.1, 0.2);
        break;
      case 'bookshelf':
        targetCamPos.current.set(0, 4.8, 10.5);
        targetCamLook.current.set(0, 2.5, -3.5);
        break;
    }
  }, [cameraMode]);

  // Three.js Mount & Animation loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x13100e);
    scene.fog = new THREE.FogExp2(0x13100e, 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // ================== LIGHTING ==================
    // Ambient light - dark moody library base
    const ambientLight = new THREE.AmbientLight(0x382a20, 1.2);
    scene.add(ambientLight);

    // Key directional light representing tall library window with warm moonlight/lantern
    const windowLight = new THREE.DirectionalLight(0xffe8c6, 2.4);
    windowLight.position.set(-6, 10, 5);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    windowLight.shadow.bias = -0.0005;
    scene.add(windowLight);

    // Antique Brass Desk Lamp Light (warm glowing spot near typewriter)
    const lampLight = new THREE.PointLight(0xffb86b, 3.2, 8, 1.4);
    lampLight.position.set(-2.2, 3.2, 0.4);
    lampLight.castShadow = true;
    lampLight.shadow.bias = -0.001;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // Soft diary reading fill light
    const diaryFill = new THREE.PointLight(0xffd5a0, 1.8, 6, 1.5);
    diaryFill.position.set(2.4, 3.0, 1.0);
    scene.add(diaryFill);

    // Subtle golden rim light behind typewriter
    const rimLight = new THREE.DirectionalLight(0xc4a66a, 1.4);
    rimLight.position.set(4, 5, -5);
    scene.add(rimLight);

    // ================== ENVIRONMENT: WALNUT DESK & LIBRARY ==================
    // Desk surface
    const deskGeo = new THREE.BoxGeometry(14, 0.8, 8);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x3d2417,
      roughness: 0.45,
      metalness: 0.08,
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0, 0);
    desk.receiveShadow = true;
    scene.add(desk);

    // Green/burgundy leather desk blotter inlay
    const blotterGeo = new THREE.BoxGeometry(6.4, 0.02, 4.2);
    const blotterMat = new THREE.MeshStandardMaterial({
      color: 0x221a17,
      roughness: 0.7,
      metalness: 0.05,
    });
    const blotter = new THREE.Mesh(blotterGeo, blotterMat);
    blotter.position.set(-0.2, 0.41, 0.2);
    blotter.receiveShadow = true;
    scene.add(blotter);

    // Desk edge brass trim
    const trimGeo = new THREE.BoxGeometry(14.05, 0.06, 0.06);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc4a66a,
      roughness: 0.25,
      metalness: 0.85,
    });
    const deskTrim = new THREE.Mesh(trimGeo, brassMat);
    deskTrim.position.set(0, 0.38, 4.02);
    scene.add(deskTrim);

    // Background Bookshelf Wall
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(0, 0, -4.5);
    scene.add(shelfGroup);

    // Shelf Wood Backing
    const shelfBackGeo = new THREE.BoxGeometry(16, 10, 0.5);
    const shelfWoodMat = new THREE.MeshStandardMaterial({
      color: 0x281911,
      roughness: 0.65,
    });
    const shelfBack = new THREE.Mesh(shelfBackGeo, shelfWoodMat);
    shelfBack.position.set(0, 5, -0.2);
    shelfGroup.add(shelfBack);

    // 3 Levels of shelves with rows of books
    const bookColors = [0x542c2d, 0x281b15, 0x1b2d2b, 0x4a3622, 0x6e2c26, 0x3a2f4c, 0xc4a66a];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
      const y = 1.6 + shelfIdx * 2.2;
      // Shelf plank
      const plank = new THREE.Mesh(new THREE.BoxGeometry(15, 0.15, 1.4), shelfWoodMat);
      plank.position.set(0, y, 0.5);
      shelfGroup.add(plank);

      // Random cluster of antique books on shelf
      let currentX = -6.5;
      while (currentX < 6.5) {
        const bookW = 0.18 + Math.random() * 0.14;
        const bookH = 1.3 + Math.random() * 0.5;
        const bookD = 0.9 + Math.random() * 0.3;
        const color = bookColors[Math.floor(Math.random() * bookColors.length)];
        const bMesh = new THREE.Mesh(
          new THREE.BoxGeometry(bookW, bookH, bookD),
          new THREE.MeshStandardMaterial({
            color,
            roughness: 0.55,
            metalness: 0.1,
          })
        );
        bMesh.position.set(currentX + bookW / 2, y + bookH / 2, 0.45);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        shelfGroup.add(bMesh);
        currentX += bookW + 0.04;
      }
    }

    // Antique Brass Desk Lamp model
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-2.2, 0.41, 0.4);
    scene.add(lampGroup);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.08, 24), brassMat);
    lampBase.position.set(0, 0.04, 0);
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 16), brassMat);
    lampStem.position.set(0, 1.25, 0);
    lampGroup.add(lampStem);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 16), brassMat);
    lampArm.rotation.z = Math.PI / 4;
    lampArm.position.set(0.35, 2.4, 0);
    lampGroup.add(lampArm);

    // Green/Amber Glass Shade
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x1f5c3b,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x0a2214,
      emissiveIntensity: 0.4,
    });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.4, 20, 1, true), shadeMat);
    shade.position.set(0.7, 2.7, 0);
    shade.rotation.z = -Math.PI / 6;
    lampGroup.add(shade);

    // Brass Quill / Inkwell prop
    const inkwell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 })
    );
    inkwell.position.set(-1.8, 0.53, -0.6);
    scene.add(inkwell);

    const quill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.03, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5ebdd, roughness: 0.4 })
    );
    quill.position.set(-1.75, 1.1, -0.6);
    quill.rotation.z = -0.3;
    quill.rotation.x = 0.2;
    scene.add(quill);

    // ================== THE HERO OBJECT: ANTIQUE MECHANICAL TYPEWRITER ==================
    const typewriterGroup = new THREE.Group();
    typewriterGroup.position.set(-0.4, 0.41, 0.2);
    scene.add(typewriterGroup);

    // Typewriter enamel finish: deep antique burgundy & black
    const enamelMat = new THREE.MeshStandardMaterial({
      color: 0x48191f, // rich vintage burgundy enamel
      roughness: 0.32,
      metalness: 0.2,
    });
    const blackIronMat = new THREE.MeshStandardMaterial({
      color: 0x1a1614, // cast iron
      roughness: 0.6,
      metalness: 0.4,
    });
    const polishedSteelMat = new THREE.MeshStandardMaterial({
      color: 0x909090,
      roughness: 0.2,
      metalness: 0.85,
    });

    // 1. Heavy Base Frame
    const baseGeo = new THREE.BoxGeometry(2.6, 0.35, 2.4);
    const baseMesh = new THREE.Mesh(baseGeo, enamelMat);
    baseMesh.position.set(0, 0.18, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    typewriterGroup.add(baseMesh);

    // Side curved wings
    const sideWingL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 2.3), enamelMat);
    sideWingL.position.set(-1.25, 0.4, 0);
    typewriterGroup.add(sideWingL);

    const sideWingR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 2.3), enamelMat);
    sideWingR.position.set(1.25, 0.4, 0);
    typewriterGroup.add(sideWingR);

    // Brass Border Trim on base
    const trimBase = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.04, 0.04), brassMat);
    trimBase.position.set(0, 0.35, 1.21);
    typewriterGroup.add(trimBase);

    // 2. Brass Engraved Nameplate: "TYPEWRITER"
    const nameplateGeo = new THREE.BoxGeometry(1.0, 0.16, 0.03);
    const nameplate = new THREE.Mesh(nameplateGeo, brassMat);
    nameplate.position.set(0, 0.22, 1.22);
    typewriterGroup.add(nameplate);

    // 3. Stepped Keyboard Well (sloping down toward user)
    const keyboardWellGeo = new THREE.BoxGeometry(2.1, 0.15, 1.1);
    const keyboardWell = new THREE.Mesh(keyboardWellGeo, blackIronMat);
    keyboardWell.position.set(0, 0.36, 0.55);
    keyboardWell.rotation.x = 0.18;
    typewriterGroup.add(keyboardWell);

    // 4. Individual Round Typewriter Keycaps
    const keyGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16);
    const keyRimMat = brassMat;
    const keyFaceMat = new THREE.MeshStandardMaterial({
      color: 0x151210,
      roughness: 0.3,
    });

    const keyRows = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    keyRows.forEach((row, rowIdx) => {
      const rowZ = 0.25 + rowIdx * 0.18;
      const rowY = 0.5 - rowIdx * 0.06;
      const xOffset = -((row.length - 1) * 0.18) / 2;

      row.forEach((char, colIdx) => {
        const keyGroup = new THREE.Group();
        const posX = xOffset + colIdx * 0.18;
        keyGroup.position.set(posX, rowY, rowZ);

        // Keycap cylinder
        const keycap = new THREE.Mesh(keyGeo, keyFaceMat);
        keycap.castShadow = true;
        keyGroup.add(keycap);

        // Brass rim
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), keyRimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.024;
        keyGroup.add(rim);

        // Key stem rod
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), polishedSteelMat);
        stem.position.y = -0.06;
        keyGroup.add(stem);

        typewriterGroup.add(keyGroup);
        keyMeshesRef.current.set(char.toUpperCase(), keycap);
      });
    });

    // Spacebar
    const spacebarGeo = new THREE.BoxGeometry(1.2, 0.06, 0.12);
    const spacebar = new THREE.Mesh(spacebarGeo, blackIronMat);
    spacebar.position.set(0, 0.28, 1.0);
    typewriterGroup.add(spacebar);
    keyMeshesRef.current.set('SPACE', spacebar);

    // 5. Typebar Arc & Striking Mechanism
    const typebarArc = new THREE.Group();
    typebarArc.position.set(0, 0.45, -0.15);
    typewriterGroup.add(typebarArc);

    // Typebar basket comb
    const combMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.08, 32, 1, false, Math.PI, Math.PI),
      blackIronMat
    );
    combMesh.position.set(0, 0.1, 0);
    combMesh.rotation.x = 0.2;
    typebarArc.add(combMesh);

    // Multiple steel typebar levers converging in fan shape
    for (let i = -7; i <= 7; i++) {
      const angle = (i / 8) * 0.65;
      const barGeo = new THREE.BoxGeometry(0.018, 0.012, 0.65);
      const bar = new THREE.Mesh(barGeo, polishedSteelMat);
      bar.position.set(Math.sin(angle) * 0.45, 0.12, -Math.cos(angle) * 0.35 + 0.3);
      bar.rotation.y = angle;
      bar.rotation.x = -0.25;
      typebarArc.add(bar);
    }

    // Central Animated Striking Typebar
    const activeBarGeo = new THREE.BoxGeometry(0.022, 0.015, 0.72);
    const activeBar = new THREE.Mesh(activeBarGeo, polishedSteelMat);
    activeBar.position.set(0, 0.15, -0.05);
    activeBar.rotation.x = -0.3;
    typebarArc.add(activeBar);
    typebarRef.current = activeBar;

    // Ink ribbon spools (two brass cylindrical spools on left & right)
    const spoolGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 20);
    const spoolL = new THREE.Mesh(spoolGeo, brassMat);
    spoolL.position.set(-0.85, 0.6, -0.1);
    typewriterGroup.add(spoolL);

    const spoolR = new THREE.Mesh(spoolGeo, brassMat);
    spoolR.position.set(0.85, 0.6, -0.1);
    typewriterGroup.add(spoolR);

    // Black/Red ribbon vibrator center guide
    const vibratorGuide = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.02), brassMat);
    vibratorGuide.position.set(0, 0.65, -0.38);
    typewriterGroup.add(vibratorGuide);

    // ================== CARRIAGE & PLATEN ASSEMBLY ==================
    const carriageGroup = new THREE.Group();
    carriageGroup.position.set(0, 0.8, -0.5);
    typewriterGroup.add(carriageGroup);
    carriageGroupRef.current = carriageGroup;

    // Carriage Frame Rail
    const railGeo = new THREE.BoxGeometry(3.2, 0.1, 0.3);
    const rail = new THREE.Mesh(railGeo, blackIronMat);
    rail.position.set(0, 0, 0);
    carriageGroup.add(rail);

    // Cylindrical Platen Roller (Hard rubber black cylinder)
    const platenGeo = new THREE.CylinderGeometry(0.22, 0.22, 2.7, 32);
    const platenMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.8,
      metalness: 0.1,
    });
    const platen = new THREE.Mesh(platenGeo, platenMat);
    platen.rotation.z = Math.PI / 2;
    platen.position.set(0, 0.18, 0);
    platen.castShadow = true;
    carriageGroup.add(platen);

    // Platen Brass Knobs at ends
    const knobGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.12, 24);
    const knobL = new THREE.Mesh(knobGeo, brassMat);
    knobL.rotation.z = Math.PI / 2;
    knobL.position.set(-1.42, 0.18, 0);
    carriageGroup.add(knobL);

    const knobR = new THREE.Mesh(knobGeo, brassMat);
    knobR.rotation.z = Math.PI / 2;
    knobR.position.set(1.42, 0.18, 0);
    carriageGroup.add(knobR);

    // Paper Bail Metal Rod & Rollers
    const bailRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 16), polishedSteelMat);
    bailRod.rotation.z = Math.PI / 2;
    bailRod.position.set(0, 0.36, 0.12);
    carriageGroup.add(bailRod);

    // Carriage Return Lever on left side
    const leverStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12), polishedSteelMat);
    leverStem.rotation.z = Math.PI / 3;
    leverStem.position.set(-1.48, 0.42, 0.1);
    carriageGroup.add(leverStem);

    // ================== PARCHMENT PAPER SHEET IN PLATEN ==================
    // Curved paper emerging from platen
    const paperGeo = new THREE.PlaneGeometry(1.9, 2.2, 16, 16);
    // Add subtle curvature around platen
    const pos = paperGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < 0) {
        // Curve around platen cylinder
        const curve = Math.sin((y / 1.1) * Math.PI) * 0.12;
        pos.setZ(i, curve);
      } else {
        // Slight natural backward tilt of paper support
        pos.setZ(i, -y * 0.15);
      }
    }
    paperGeo.computeVertexNormals();

    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xe8d5af, // warm aged ivory parchment
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 0.95, -0.06);
    paperMesh.castShadow = true;
    carriageGroup.add(paperMesh);
    paperMeshRef.current = paperMesh;

    // ================== FLYING ARCHIVING PAPER MESH ==================
    const flyingPaperGeo = new THREE.PlaneGeometry(1.9, 2.4, 8, 8);
    const flyingPaper = new THREE.Mesh(flyingPaperGeo, paperMat);
    flyingPaper.visible = false;
    flyingPaper.castShadow = true;
    scene.add(flyingPaper);
    flyingPaperRef.current = flyingPaper;

    // ================== THE COMPANION HERO OBJECT: ANTIQUE LEATHER DIARY ==================
    const diaryGroup = new THREE.Group();
    diaryGroup.position.set(2.4, 0.41, 0.3);
    diaryGroup.rotation.y = -0.15;
    scene.add(diaryGroup);

    // Active Book Leather Cover Color
    const leatherColor = new THREE.Color(activeBook?.coverColor || '#542C2D');
    const leatherMat = new THREE.MeshStandardMaterial({
      color: leatherColor,
      roughness: 0.65,
      metalness: 0.08,
    });

    // Book Back Cover (rests on desk)
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 2.8), leatherMat);
    backCover.position.set(0, 0.03, 0);
    backCover.receiveShadow = true;
    diaryGroup.add(backCover);

    // Spine
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.8, 16, 1, false, 0, Math.PI), leatherMat);
    spine.rotation.x = Math.PI / 2;
    spine.rotation.y = Math.PI / 2;
    spine.position.set(-1.05, 0.24, 0);
    diaryGroup.add(spine);

    // Spine bands / raised ribs
    for (let r = -3; r <= 3; r++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 16, Math.PI), brassMat);
      rib.rotation.y = Math.PI / 2;
      rib.position.set(-1.05, 0.24, (r / 3.5) * 1.1);
      diaryGroup.add(rib);
    }

    // Thick Page Block (warm ivory aged leaves)
    const pageBlockMat = new THREE.MeshStandardMaterial({
      color: 0xdec69e,
      roughness: 0.9,
    });
    const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.38, 2.65), pageBlockMat);
    pageBlock.position.set(0.04, 0.24, 0);
    pageBlock.receiveShadow = true;
    diaryGroup.add(pageBlock);

    // Book Front Cover (hinged to spine)
    const frontCoverGroup = new THREE.Group();
    frontCoverGroup.position.set(-1.05, 0.44, 0);
    diaryGroup.add(frontCoverGroup);
    diaryCoverRef.current = frontCoverGroup;

    const frontCover = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 2.8), leatherMat);
    frontCover.position.set(1.05, 0, 0);
    frontCover.castShadow = true;
    frontCoverGroup.add(frontCover);

    // Gilded Brass Title Plate on Diary Cover
    const titlePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.7), brassMat);
    titlePlate.position.set(1.05, 0.04, 0);
    frontCoverGroup.add(titlePlate);

    // Corner brass filigree mounts
    const cornerMat = brassMat;
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.25), cornerMat);
    c1.position.set(2.0, 0.04, 1.3);
    frontCoverGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.25), cornerMat);
    c2.position.set(2.0, 0.04, -1.3);
    frontCoverGroup.add(c2);

    // ================== ANIMATION LOOP ==================
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const time = now / 1000;

      // Smooth camera interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.045);
        const currentLook = new THREE.Vector3();
        cameraRef.current.getWorldDirection(currentLook);
        
        // Compute desired look target
        const tempLook = targetCamLook.current.clone();
        cameraRef.current.lookAt(tempLook);
      }

      // 1. Carriage movement based on current column ratio
      if (carriageGroupRef.current) {
        // As characters are typed, the carriage shifts to the left
        // Horizontal carriage span: from 0.45 (margin left) to -0.45 (margin right)
        const targetCarriageX = 0.45 - carriageRatio * 0.9;
        carriageGroupRef.current.position.x = THREE.MathUtils.lerp(
          carriageGroupRef.current.position.x,
          targetCarriageX,
          0.2
        );

        // Subtle platen vertical rotation / advancement based on line
        const targetPaperY = 0.95 + lineRatio * 0.25;
        if (paperMeshRef.current) {
          paperMeshRef.current.position.y = THREE.MathUtils.lerp(
            paperMeshRef.current.position.y,
            targetPaperY,
            0.15
          );
        }
      }

      // 2. Subtle desk lamp flicker / breathing
      if (lampLightRef.current) {
        lampLightRef.current.intensity = 3.2 + Math.sin(time * 3.5) * 0.08 + (Math.random() - 0.5) * 0.03;
      }

      // 3. Diary cover opening state
      if (diaryCoverRef.current) {
        // If in diary mode or archiving, open the diary cover; otherwise closed
        const targetAngle = (cameraMode === 'diary' || isArchiving) ? -Math.PI * 0.92 : 0;
        diaryCoverRef.current.rotation.z = THREE.MathUtils.lerp(
          diaryCoverRef.current.rotation.z,
          targetAngle,
          0.05
        );
      }

      // 4. Paper Archiving Choreography
      if (flyingPaperRef.current) {
        if (isArchiving) {
          flyingPaperRef.current.visible = true;
          // Hide typewriter paper as it "ejects"
          if (paperMeshRef.current) {
            paperMeshRef.current.visible = archiveProgress < 0.1;
          }

          // Parabolic flight trajectory from typewriter (-0.4, 1.4, -0.3) to open diary (2.4, 0.8, 0.3)
          const p = archiveProgress; // 0 to 1
          const startX = -0.4;
          const startY = 1.6;
          const startZ = -0.3;

          const endX = 2.45;
          const endY = 0.72;
          const endZ = 0.3;

          // Smooth bezier-like arc
          const curX = THREE.MathUtils.lerp(startX, endX, p);
          const arcHeight = Math.sin(p * Math.PI) * 1.5;
          const curY = THREE.MathUtils.lerp(startY, endY, p) + arcHeight;
          const curZ = THREE.MathUtils.lerp(startZ, endZ, p);

          flyingPaperRef.current.position.set(curX, curY, curZ);

          // Rotate from vertical typing orientation to flat resting inside book
          const startRotX = -Math.PI / 12;
          const endRotX = -Math.PI / 2;
          flyingPaperRef.current.rotation.x = THREE.MathUtils.lerp(startRotX, endRotX, p);

          const startRotY = 0;
          const endRotY = -0.15;
          flyingPaperRef.current.rotation.y = THREE.MathUtils.lerp(startRotY, endRotY, p);
          
          // Paper flutter curl during mid-air flight
          flyingPaperRef.current.rotation.z = Math.sin(p * Math.PI * 2) * 0.08;
        } else {
          flyingPaperRef.current.visible = false;
          if (paperMeshRef.current) {
            paperMeshRef.current.visible = true;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update book cover color on activeBook change
  useEffect(() => {
    // Dynamically update diary cover color
    if (sceneRef.current && activeBook) {
      // Find diary meshes and update if needed
    }
  }, [activeBook]);

  // Keystroke physical animation trigger
  useEffect(() => {
    if (!activeKeyChar) return;

    // 1. Depress visual keycap
    const upper = activeKeyChar.toUpperCase();
    const keyMesh = keyMeshesRef.current.get(upper) || keyMeshesRef.current.get(activeKeyChar === ' ' ? 'SPACE' : upper);
    if (keyMesh) {
      const origY = keyMesh.position.y;
      keyMesh.position.y -= 0.035;
      setTimeout(() => {
        keyMesh.position.y = origY;
      }, 70);
    }

    // 2. Strike typebar forward against ribbon & platen
    if (typebarRef.current) {
      typebarRef.current.rotation.x = 0.55; // strike
      typebarRef.current.position.z = -0.28;
      setTimeout(() => {
        if (typebarRef.current) {
          typebarRef.current.rotation.x = -0.3; // return to rest
          typebarRef.current.position.z = -0.05;
        }
      }, 65);
    }
  }, [activeKeyChar]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        onClick={(e) => {
          // If clicked in left/middle region, notify typewriter click; if right region, notify diary click
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          if (x > 0.65) {
            onDiaryClick?.();
          } else {
            onTypewriterClick?.();
          }
        }}
      />
    </div>
  );
};
