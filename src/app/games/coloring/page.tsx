"use client";

import { useEffect } from "react";
import GameHeader from "@/components/GameHeader";
import { getAnimalImageCatalog } from "@/lib/animalCatalog";
import { initColoringGame } from "./coloringLogic";
import "./coloring.css";

const animals = getAnimalImageCatalog().map((animal) => ({
  id: animal.id,
  label: animal.labelTh,
  image: animal.image,
}));

export default function ColoringGamePage() {
  useEffect(() => {
    const cleanup = initColoringGame();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="app-container">
      <GameHeader
        title="ระบายสีเวทมนตร์"
        icon="🎨"
        actions={
          <>
            <div className="progress-wrap">
              <span className="progress-label">เปิดเผยแล้ว</span>
              <div className="progress-bar-outer">
                <div className="progress-bar-inner" id="progress-bar"></div>
              </div>
              <span className="progress-pct" id="progress-pct">0%</span>
            </div>
            <button className="action-btn" id="btn-sound-toggle" title="เปิด/ปิดเสียง">🔊</button>
            <button className="action-btn" id="btn-new-animal" title="เปลี่ยนภาพ">🔀 เปลี่ยน</button>
          </>
        }
      />

      <main className="game-main">
        <div className="animal-selector" id="animal-selector">
          {animals.map((animal, index) => (
            <button
              key={animal.id}
              className={`animal-pill ${index === 0 ? "active" : ""}`}
              data-animal={animal.id}
              id={`pick-${animal.id}`}
            >
              <img src={animal.image} alt={animal.label} />
              <span>{animal.label}</span>
            </button>
          ))}
        </div>

        <div className="canvas-area" id="canvas-area">
          <div className="canvas-card" id="canvas-card">
            <div className="brush-bar">
              <span className="brush-label">🖌️ ขนาดแปรง</span>
              <button className="brush-btn active" data-size="40" id="brush-sm">S</button>
              <button className="brush-btn" data-size="70" id="brush-md">M</button>
              <button className="brush-btn" data-size="110" id="brush-lg">L</button>
              <button className="brush-btn" data-size="160" id="brush-xl">XL</button>
            </div>

            <div className="canvas-wrapper" id="canvas-wrapper">
              <img id="coloring-bg-img" className="coloring-bg-img" alt="" aria-hidden="true" />
              <canvas id="coloring-canvas"></canvas>
              <div className="loading-overlay" id="loading-overlay">
                <div className="spinner"></div>
                <span>กำลังโหลดรูป...</span>
              </div>
              <div className="hint-overlay" id="hint-overlay">
                <div className="hint-content">
                  <span className="hint-emoji">✨</span>
                  <p>ลากนิ้วหรือเมาส์บนรูป<br />เพื่อเปิดเผยภาพสัตว์น่ารัก!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="modal-overlay" id="victory-modal">
        <div className="modal-content victory-card">
          <div className="victory-ribbon">🌈 เปิดภาพสำเร็จ! 🌈</div>
          <div className="victory-animal-preview" id="victory-preview"></div>
          <h2>ยอดเยี่ยมมากๆ!</h2>
          <p className="victory-sub">คุณเปิดเผยภาพสัตว์ได้ครบแล้ว 🎉</p>
          <div className="victory-btns">
            <button className="victory-btn primary" id="btn-next-animal">ภาพต่อไป ➡️</button>
            <button className="victory-btn secondary" id="btn-play-again">ลองใหม่ 🔄</button>
          </div>
        </div>
      </div>
    </div>
  );
}
