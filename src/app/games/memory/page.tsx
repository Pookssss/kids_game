"use client";

import { useEffect } from "react";
import GameHeader from "@/components/GameHeader";
import { initMemoryGame } from "./memoryLogic";
import "./memory.css";

export default function MemoryGamePage() {
  useEffect(() => {
    initMemoryGame();
  }, []);

  return (
    <div className="app-container">
      <GameHeader
        title="จับคู่ภาพสัตว์"
        icon="🃏"
        actions={
          <>
            <div className="score-display">
              <span className="score-label">คู่ที่ได้</span>
              <span className="score-value" id="score-display">0</span>
            </div>
            <div className="score-display">
              <span className="score-label">ครั้งที่พลิก</span>
              <span className="score-value" id="moves-display">0</span>
            </div>
            <button className="action-btn" id="btn-sound-toggle" title="เปิด/ปิดเสียง">
              🔊
            </button>
            <button className="action-btn" id="btn-new-game" title="เริ่มเกมใหม่">
              🔄 ใหม่
            </button>
          </>
        }
      />

      <main className="game-main">
        <div className="diff-bar">
          <button className="diff-pill active" data-mode="easy" id="mode-easy">🌟 ง่าย (4 คู่)</button>
          <button className="diff-pill" data-mode="medium" id="mode-medium">🔥 ปานกลาง (6 คู่)</button>
          <button className="diff-pill" data-mode="hard" id="mode-hard">💪 ท้าทาย (8 คู่)</button>
        </div>

        <div className="card-grid-container">
          <div className="card-grid" id="card-grid"></div>
        </div>
      </main>

      <div className="modal-overlay" id="victory-modal">
        <div className="modal-content victory-card">
          <div className="victory-ribbon">🎉 เก่งมากเลย! 🎉</div>
          <div className="victory-emoji" id="victory-emoji">🏆</div>
          <h2>จับคู่สำเร็จทั้งหมด!</h2>
          <p className="victory-sub" id="victory-stats">เยี่ยมมาก!</p>
          <button className="play-again-btn" id="btn-play-again">เล่นอีกรอบ 🔄</button>
        </div>
      </div>
    </div>
  );
}
