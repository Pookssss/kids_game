"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GameHeader from "@/components/GameHeader";
import Modal from "@/components/Modal";
import { Game, AudioSynth } from "./jigsawLogic";
import "./jigsaw.css";

const JIGSAW_LAST_ANIMAL_KEY = "kids_game_jigsaw_last_animal";
const ANIMAL_OPTIONS = [
  { id: "panda", label: "แพนด้า" },
  { id: "lion", label: "สิงโต" },
  { id: "elephant", label: "ช้างน้อย" },
  { id: "fox", label: "จิ้งจอก" },
  { id: "cat", label: "แมวเหมียว" },
  { id: "koala", label: "โคอาล่า" },
  { id: "rabbit", label: "กระต่าย" },
  { id: "monkey", label: "ลิงซน" },
];

type AspectRatioLock = "free" | "1:1" | "4:3" | "16:9";
type CropRect = { x: number; y: number; width: number; height: number };

export default function JigsawGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customImageObjectUrlRef = useRef<string | null>(null);
  const cropDragRef = useRef({
    active: false,
    pointerId: -1,
    mode: "draw" as "draw" | "move",
    startXPx: 0,
    startYPx: 0,
    pointerOffsetXPx: 0,
    pointerOffsetYPx: 0,
    initialRect: null as CropRect | null,
    width: 1,
    height: 1,
  });
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [customCropRect, setCustomCropRect] = useState<CropRect | null>(null);
  
  // Game States
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);

  // Parent Gate & Settings States
  const [showGate, setShowGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ q: "", ans: 0 });
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState(false);

  // Settings Draft
  const [draftSettings, setDraftSettings] = useState({
    animal: "panda",
    grid: 3,
    hint: false,
    border: false,
    sound: true,
    imageMode: "preset" as "preset" | "upload",
    aspectRatio: "free" as AspectRatioLock,
    region: "full" as "full" | "top" | "bottom" | "left" | "right" | "center",
  });

  useEffect(() => {
    if (canvasRef.current) {
      const animalIds = ANIMAL_OPTIONS.map((a) => a.id);
      const lastAnimal = localStorage.getItem(JIGSAW_LAST_ANIMAL_KEY);
      const availableAnimals = animalIds.filter((id) => id !== lastAnimal);
      const randomPool = availableAnimals.length > 0 ? availableAnimals : animalIds;
      const randomAnimal = randomPool[Math.floor(Math.random() * randomPool.length)];

      Game.currentAnimal = randomAnimal;
      localStorage.setItem(JIGSAW_LAST_ANIMAL_KEY, randomAnimal);

      Game.init(canvasRef.current, {
        setLoading: setIsLoading,
        onVictory: (data: any) => setVictoryData(data),
        onHintChange: (hint: boolean) => setShowHint(hint),
      });

      // Bind canvas mouse/touch events manually since we removed setupEventListeners inside Game.init()
      const canvas = canvasRef.current;
      const onDragStart = (e: any) => Game.onDragStart(e);
      const onDragMove = (e: any) => Game.onDragMove(e);
      const onDragEnd = (e: any) => Game.onDragEnd();

      canvas.addEventListener("mousedown", onDragStart);
      canvas.addEventListener("mousemove", onDragMove);
      canvas.addEventListener("mouseup", onDragEnd);
      canvas.addEventListener("mouseleave", onDragEnd);

      const onTouchStart = (e: any) => { e.preventDefault(); Game.onDragStart(e); };
      const onTouchMove = (e: any) => { e.preventDefault(); Game.onDragMove(e); };
      const onTouchEnd = (e: any) => { e.preventDefault(); Game.onDragEnd(); };
      
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd, { passive: false });

      return () => {
        document.body.style.overflow = "";
        if (customImageObjectUrlRef.current) {
          URL.revokeObjectURL(customImageObjectUrlRef.current);
          customImageObjectUrlRef.current = null;
        }

        canvas.removeEventListener("mousedown", onDragStart);
        canvas.removeEventListener("mousemove", onDragMove);
        canvas.removeEventListener("mouseup", onDragEnd);
        canvas.removeEventListener("mouseleave", onDragEnd);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, []);

  const handleOpenGate = () => {
    const num1 = Math.floor(2 + Math.random() * 8);
    const num2 = Math.floor(2 + Math.random() * 8);
    setGateQuestion({ q: `${num1} + ${num2} = ?`, ans: num1 + num2 });
    setGateInput("");
    setGateError(false);
    setShowGate(true);
  };

  const handleVerifyGate = () => {
    if (parseInt(gateInput) === gateQuestion.ans) {
      setShowGate(false);
      
      // Load current settings into draft
      const hasCustomImage = !!Game.customImageSrc;
      setDraftSettings({
        animal: Game.currentAnimal,
        grid: Game.gridSize,
        hint: Game.showHint,
        border: Game.showBordersOnly,
        sound: AudioSynth.enabled,
        imageMode: hasCustomImage ? "upload" : "preset",
        aspectRatio: (Game.cropAspectRatio || "free") as AspectRatioLock,
        region: (Game.imageRegion || "full") as "full" | "top" | "bottom" | "left" | "right" | "center",
      });
      setCustomImagePreview(hasCustomImage ? Game.customImageSrc : null);
      setCustomCropRect(Game.customCropRect || null);
      setShowSettings(true);
    } else {
      setGateError(true);
      setGateInput("");
    }
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    if (customImageObjectUrlRef.current) {
      URL.revokeObjectURL(customImageObjectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    customImageObjectUrlRef.current = objectUrl;
    setCustomImagePreview(objectUrl);
    setCustomCropRect(null);
    setDraftSettings((prev) => ({ ...prev, imageMode: "upload" }));

    // Reset input value so selecting the same file again still triggers onChange.
    e.target.value = "";
  };

  const getAspectRatioValue = (ratio: AspectRatioLock) => {
    if (ratio === "1:1") return 1;
    if (ratio === "4:3") return 4 / 3;
    if (ratio === "16:9") return 16 / 9;
    return null;
  };

  const beginCropSelectionAtPoint = (
    clientX: number,
    clientY: number,
    container: HTMLDivElement,
    dragId: number
  ) => {
    if (!customImagePreview) return;
    const rect = container.getBoundingClientRect();
    const startXPx = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const startYPx = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const pointerXNorm = startXPx / rect.width;
    const pointerYNorm = startYPx / rect.height;
    const clickedInsideExistingRect = !!customCropRect &&
      pointerXNorm >= customCropRect.x &&
      pointerXNorm <= customCropRect.x + customCropRect.width &&
      pointerYNorm >= customCropRect.y &&
      pointerYNorm <= customCropRect.y + customCropRect.height;

    if (clickedInsideExistingRect && customCropRect) {
      cropDragRef.current = {
        active: true,
        pointerId: dragId,
        mode: "move",
        startXPx,
        startYPx,
        pointerOffsetXPx: startXPx - customCropRect.x * rect.width,
        pointerOffsetYPx: startYPx - customCropRect.y * rect.height,
        initialRect: customCropRect,
        width: rect.width,
        height: rect.height,
      };
      document.body.style.overflow = "hidden";
      return;
    }

    cropDragRef.current = {
      active: true,
      pointerId: dragId,
      mode: "draw",
      startXPx,
      startYPx,
      pointerOffsetXPx: 0,
      pointerOffsetYPx: 0,
      initialRect: null,
      width: rect.width,
      height: rect.height,
    };

    setCustomCropRect({
      x: startXPx / rect.width,
      y: startYPx / rect.height,
      width: 0.001,
      height: 0.001,
    });
    document.body.style.overflow = "hidden";
  };

  const updateCropSelectionAtPoint = (
    clientX: number,
    clientY: number,
    container: HTMLDivElement,
    dragId: number
  ) => {
    if (!cropDragRef.current.active || cropDragRef.current.pointerId !== dragId) return;
    const { startXPx, startYPx, width, height, mode, pointerOffsetXPx, pointerOffsetYPx, initialRect } = cropDragRef.current;
    const bounds = container.getBoundingClientRect();
    const currentXPx = Math.max(0, Math.min(width, clientX - bounds.left));
    const currentYPx = Math.max(0, Math.min(height, clientY - bounds.top));

    if (mode === "move" && initialRect) {
      const rectWidthPx = initialRect.width * width;
      const rectHeightPx = initialRect.height * height;

      let nextLeftPx = currentXPx - pointerOffsetXPx;
      let nextTopPx = currentYPx - pointerOffsetYPx;

      nextLeftPx = Math.max(0, Math.min(width - rectWidthPx, nextLeftPx));
      nextTopPx = Math.max(0, Math.min(height - rectHeightPx, nextTopPx));

      setCustomCropRect({
        x: nextLeftPx / width,
        y: nextTopPx / height,
        width: initialRect.width,
        height: initialRect.height,
      });
      return;
    }

    const ratio = getAspectRatioValue(draftSettings.aspectRatio);
    let endXPx = currentXPx;
    let endYPx = currentYPx;

    if (ratio) {
      const signX = endXPx >= startXPx ? 1 : -1;
      const signY = endYPx >= startYPx ? 1 : -1;
      const maxWidthByBounds = signX > 0 ? width - startXPx : startXPx;
      const maxHeightByBounds = signY > 0 ? height - startYPx : startYPx;

      const requestedWidth = Math.abs(endXPx - startXPx);
      const requestedHeight = Math.abs(endYPx - startYPx);

      let targetWidth = requestedWidth;
      let targetHeight = requestedHeight;

      if (requestedWidth / ratio >= requestedHeight) {
        targetHeight = requestedWidth / ratio;
      } else {
        targetWidth = requestedHeight * ratio;
      }

      targetWidth = Math.min(targetWidth, maxWidthByBounds, maxHeightByBounds * ratio);
      targetHeight = targetWidth / ratio;

      endXPx = startXPx + signX * targetWidth;
      endYPx = startYPx + signY * targetHeight;
    }

    const left = Math.min(startXPx, endXPx);
    const top = Math.min(startYPx, endYPx);
    const rectWidth = Math.max(6, Math.abs(endXPx - startXPx));
    const rectHeight = Math.max(6, Math.abs(endYPx - startYPx));

    setCustomCropRect({
      x: left / width,
      y: top / height,
      width: Math.min(1 - left / width, rectWidth / width),
      height: Math.min(1 - top / height, rectHeight / height),
    });
  };

  const beginCropSelection = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    e.preventDefault();
    beginCropSelectionAtPoint(e.clientX, e.clientY, e.currentTarget, e.pointerId);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const updateCropSelection = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    e.preventDefault();
    updateCropSelectionAtPoint(e.clientX, e.clientY, e.currentTarget, e.pointerId);
  };

  const handleCropTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!customImagePreview) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    e.preventDefault();
    beginCropSelectionAtPoint(touch.clientX, touch.clientY, e.currentTarget, touch.identifier);
  };

  const handleCropTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cropDragRef.current.active) return;
    const dragId = cropDragRef.current.pointerId;
    const touch = Array.from(e.touches).find((t) => t.identifier === dragId);
    if (!touch) return;
    e.preventDefault();
    updateCropSelectionAtPoint(touch.clientX, touch.clientY, e.currentTarget, dragId);
  };

  const handleCropTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cropDragRef.current.active) return;
    const dragId = cropDragRef.current.pointerId;
    const touchEnded = Array.from(e.changedTouches).some((t) => t.identifier === dragId);
    if (!touchEnded) return;
    e.preventDefault();
    cropDragRef.current.active = false;
    cropDragRef.current.pointerId = -1;
    document.body.style.overflow = "";
  };

  const endCropSelection = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (!cropDragRef.current.active || cropDragRef.current.pointerId !== e.pointerId) return;
    e.preventDefault();
    cropDragRef.current.active = false;
    cropDragRef.current.pointerId = -1;
    document.body.style.overflow = "";
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSaveSettings = () => {
    Game.currentAnimal = draftSettings.animal;
    Game.gridSize = draftSettings.grid;
    Game.showHint = draftSettings.hint;
    Game.showBordersOnly = draftSettings.border;
    AudioSynth.enabled = draftSettings.sound;
    Game.imageRegion = draftSettings.region;
    Game.cropAspectRatio = draftSettings.aspectRatio;
    Game.customCropRect = customCropRect as any;

    if (draftSettings.imageMode === "upload" && customImagePreview) {
      Game.customImageSrc = customImagePreview as any;
      Game.useCustomImageNextRoundOnly = true;
    } else {
      Game.customImageSrc = null;
      Game.useCustomImageNextRoundOnly = false;
      Game.customCropRect = null;
      Game.cropAspectRatio = "free";
      setCustomImagePreview(null);
    }

    setShowHint(draftSettings.hint);
    
    setShowSettings(false);
    Game.loadPuzzle();
  };

  const animals = ANIMAL_OPTIONS;

  return (
    <div className="app-container">
      <GameHeader
        title="จิ๊กซอว์สัตว์แสนสนุก"
        icon="🧩"
        actions={
          <>
            <button
              className="parent-settings-trigger"
              onClick={() => { AudioSynth.playPick(); Game.shufflePieces(); }}
              title="สุ่มสลับชิ้นส่วนใหม่"
            >
              <span className="gear-icon">🔀</span>
              <span className="gear-text">สลับชิ้นส่วน</span>
            </button>
            <button
              className="parent-settings-trigger"
              onClick={handleOpenGate}
            >
              <span className="gear-icon">⚙️</span>
              <span className="gear-text">สำหรับผู้ปกครอง</span>
            </button>
          </>
        }
      />

      <main className="game-main-clean">
        <section className="workspace-area-clean">
          <div className="board-container-clean card">
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} id="game-canvas"></canvas>
              {isLoading && (
                <div className="loading-overlay active">
                  <div className="spinner"></div>
                  <span>กำลังเตรียมจิ๊กซอว์...</span>
                </div>
              )}
            </div>
          </div>
          <div className="kid-controls">
            <button
              className={`kid-action-btn ${showHint ? "active" : ""}`}
              onClick={() => {
                const newHint = !showHint;
                setShowHint(newHint);
                Game.showHint = newHint;
                AudioSynth.playPick();
              }}
            >
              <span className="btn-emoji">👁️</span>
              <span className="btn-text">เปิดรูปตัวอย่างลางๆ</span>
            </button>
          </div>
        </section>
      </main>

      {/* Parent Gate Modal */}
      <Modal isOpen={showGate} onClose={() => setShowGate(false)} className="parent-gate-card">
        <h2>🔒 พื้นที่สำหรับผู้ปกครอง</h2>
        <p className="gate-instruction">กรุณาตอบคำถามด้านล่างเพื่อเข้าสู่การตั้งค่า</p>
        <div className="math-question-container">
          <span className="math-question">{gateQuestion.q}</span>
        </div>
        <div className="math-input-wrapper">
          <input
            type="number"
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="คำตอบ"
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerifyGate(); }}
            style={{ borderColor: gateError ? "#ff4757" : "#e1e8ed" }}
          />
        </div>
        {gateError && <div className="gate-error" style={{ display: "block" }}>คำตอบยังไม่ถูกต้อง ลองใหม่อีกครั้งนะคะ</div>}
        <div className="modal-buttons">
          <button className="modal-btn primary" onClick={handleVerifyGate}>เข้าสู่การตั้งค่า</button>
        </div>
      </Modal>

      {/* Parent Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} className="parent-settings-card">
        <h2>⚙️ การตั้งค่าสำหรับผู้ปกครอง</h2>
        <div className="settings-layout">
          <div className="settings-section">
            <h3>แหล่งรูปภาพ</h3>
            <div className="image-mode-switch">
              <button
                className={`mode-btn ${draftSettings.imageMode === "preset" ? "active" : ""}`}
                onClick={() => {
                  AudioSynth.playPick();
                  setDraftSettings({ ...draftSettings, imageMode: "preset" });
                  setCustomCropRect(null);
                }}
              >
                ใช้รูปสัตว์ในเกม
              </button>
              <button
                className={`mode-btn ${draftSettings.imageMode === "upload" ? "active" : ""}`}
                onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, imageMode: "upload" }); }}
              >
                อัปโหลดรูปเอง
              </button>
            </div>

            {draftSettings.imageMode === "upload" && (
              <div className="upload-panel">
                <label className="upload-btn" htmlFor="jigsaw-custom-image-input">
                  เลือกรูปจากเครื่อง
                </label>
                <input
                  id="jigsaw-custom-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                />
                <div className="ratio-selector-settings">
                  {([
                    { id: "free", label: "อิสระ" },
                    { id: "1:1", label: "1:1" },
                    { id: "4:3", label: "4:3" },
                    { id: "16:9", label: "16:9" },
                  ] as { id: AspectRatioLock; label: string }[]).map((ratio) => (
                    <button
                      key={ratio.id}
                      className={`ratio-btn-settings ${draftSettings.aspectRatio === ratio.id ? "active" : ""}`}
                      onClick={() => {
                        AudioSynth.playPick();
                        setDraftSettings({ ...draftSettings, aspectRatio: ratio.id });
                      }}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
                {customImagePreview ? (
                  <div className="custom-preview-wrap">
                    <div
                      className="crop-preview-area"
                      onPointerDown={beginCropSelection}
                      onPointerMove={updateCropSelection}
                      onPointerUp={endCropSelection}
                      onPointerCancel={endCropSelection}
                      onTouchStart={handleCropTouchStart}
                      onTouchMove={handleCropTouchMove}
                      onTouchEnd={handleCropTouchEnd}
                      onTouchCancel={handleCropTouchEnd}
                    >
                      <img src={customImagePreview} alt="ตัวอย่างรูปที่อัปโหลด" className="custom-preview-img" draggable={false} />
                      {customCropRect && (
                        <div
                          className="crop-selection-box"
                          style={{
                            left: `${customCropRect.x * 100}%`,
                            top: `${customCropRect.y * 100}%`,
                            width: `${customCropRect.width * 100}%`,
                            height: `${customCropRect.height * 100}%`,
                          }}
                        />
                      )}
                    </div>
                    <div className="crop-tools-row">
                      <span className="upload-note">ลากบนภาพเพื่อกำหนดกรอบ crop แบบละเอียด</span>
                      <button
                        className="clear-crop-btn"
                        onClick={() => setCustomCropRect(null)}
                      >
                        ล้างกรอบ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="upload-note">ยังไม่ได้เลือกไฟล์ รูปนี้จะถูกใช้เฉพาะรอบถัดไปที่เริ่มเกม</p>
                )}
              </div>
            )}

            {draftSettings.imageMode === "preset" && (
              <>
                <h3 style={{ marginTop: "16px" }}>เลือกรูปภาพสัตว์ (8 ชนิด)</h3>
                <div className="animal-grid-scroll">
                  <div className="animal-grid">
                    {animals.map((a) => (
                      <button
                        key={a.id}
                        className={`animal-card ${draftSettings.animal === a.id ? "active" : ""}`}
                        onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, animal: a.id }); }}
                      >
                        <div className="animal-img-wrapper">
                          <Image src={`/assets/cute_${a.id}.png`} alt={a.label} width={60} height={60} />
                        </div>
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="settings-section">
            <h3>ระดับความยาก</h3>
            <div className="difficulty-selector-settings">
              {[
                { g: 2, t: "เด็กเล็กพิเศษ (2 × 2)", p: "4 ชิ้น" },
                { g: 3, t: "ง่าย (3 × 3)", p: "9 ชิ้น" },
                { g: 6, t: "ปานกลาง (6 × 6)", p: "36 ชิ้น" },
                { g: 9, t: "ท้าทาย (9 × 9)", p: "81 ชิ้น" },
              ].map((lvl) => (
                <button
                  key={lvl.g}
                  className={`diff-btn-settings ${draftSettings.grid === lvl.g ? "active" : ""}`}
                  onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, grid: lvl.g }); }}
                >
                  <span className="diff-level">{lvl.t}</span>
                  <span className="diff-pieces">{lvl.p}</span>
                </button>
              ))}
            </div>
            <h3 style={{ marginTop: "20px" }}>เลือกส่วนของรูปที่จะเล่น</h3>
            <div className="region-selector-settings">
              {[
                { id: "full", label: "ทั้งภาพ" },
                { id: "top", label: "ครึ่งบน" },
                { id: "bottom", label: "ครึ่งล่าง" },
                { id: "left", label: "ครึ่งซ้าย" },
                { id: "right", label: "ครึ่งขวา" },
                { id: "center", label: "ตรงกลาง" },
              ].map((region) => (
                <button
                  key={region.id}
                  className={`region-btn-settings ${draftSettings.region === region.id ? "active" : ""}`}
                  onClick={() => {
                    AudioSynth.playPick();
                    setDraftSettings({ ...draftSettings, region: region.id as typeof draftSettings.region });
                  }}
                >
                  {region.label}
                </button>
              ))}
            </div>
            <h3 style={{ marginTop: "20px" }}>ตัวเลือกเพิ่มเติม</h3>
            <div className="options-grid-settings">
              <button
                className={`setting-option-btn ${draftSettings.hint ? "active" : ""}`}
                onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, hint: !draftSettings.hint }); }}
              >
                <span className="opt-icon">👁️</span><span className="opt-text">ตัวช่วยภาพลาง</span>
              </button>
              <button
                className={`setting-option-btn ${draftSettings.border ? "active" : ""}`}
                onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, border: !draftSettings.border }); }}
              >
                <span className="opt-icon">🖼️</span><span className="opt-text">เฉพาะชิ้นขอบ</span>
              </button>
              <button
                className={`setting-option-btn ${draftSettings.sound ? "active" : ""}`}
                onClick={() => { AudioSynth.playPick(); setDraftSettings({ ...draftSettings, sound: !draftSettings.sound }); }}
              >
                <span className="opt-icon">{draftSettings.sound ? "🔊" : "🔇"}</span>
                <span className="opt-text">{draftSettings.sound ? "เปิดเสียง" : "ปิดเสียง"}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="modal-buttons" style={{ marginTop: "25px" }}>
          <button className="modal-btn primary" onClick={handleSaveSettings}>ตกลง & เริ่มเกม 🎮</button>
        </div>
      </Modal>

      {/* Victory Modal */}
      <Modal isOpen={!!victoryData} hideCloseBtn className="victory-card-clean">
        <div className="victory-ribbon">🎉 เก่งที่สุดเลย! 🎉</div>
        <div className="victory-emoji">⭐️🦁⭐️</div>
        <h2>เย้! ต่อจิ๊กซอว์สำเร็จแล้ว!</h2>
        <p className="victory-subtext">คนเก่งเก่งมากๆ เลยครับ/ค่ะ!</p>
        
        {victoryData && (
          <div className="victory-stats-hidden" style={{ display: "none" }}>
            <span>{victoryData.mins}:{victoryData.secs}</span>
            <span>{victoryData.moves}</span>
            <span>{victoryData.diff}</span>
          </div>
        )}
        
        <div className="modal-buttons">
          <button
            className="modal-btn primary"
            style={{ fontSize: "1.1rem", padding: "14px 24px", borderRadius: "16px" }}
            onClick={() => {
              setVictoryData(null);
              Game.loadPuzzle();
            }}
          >
            เล่นอีกรอบ 🔄
          </button>
          <button
            className="modal-btn secondary"
            style={{ fontSize: "1.1rem", padding: "14px 24px", borderRadius: "16px" }}
            onClick={() => {
              setVictoryData(null);
              const idx = animals.findIndex((a) => a.id === Game.currentAnimal);
              const next = animals[(idx + 1) % animals.length].id;
              Game.currentAnimal = next;
              Game.loadPuzzle();
            }}
          >
            ถัดไป ▶️
          </button>
        </div>
      </Modal>
    </div>
  );
}
