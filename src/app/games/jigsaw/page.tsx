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

export default function JigsawGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
      setDraftSettings({
        animal: Game.currentAnimal,
        grid: Game.gridSize,
        hint: Game.showHint,
        border: Game.showBordersOnly,
        sound: AudioSynth.enabled,
      });
      setShowSettings(true);
    } else {
      setGateError(true);
      setGateInput("");
    }
  };

  const handleSaveSettings = () => {
    Game.currentAnimal = draftSettings.animal;
    Game.gridSize = draftSettings.grid;
    Game.showHint = draftSettings.hint;
    Game.showBordersOnly = draftSettings.border;
    AudioSynth.enabled = draftSettings.sound;
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
            <h3>เลือกรูปภาพสัตว์ (8 ชนิด)</h3>
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
