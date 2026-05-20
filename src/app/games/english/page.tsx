"use client";

import { useEffect } from "react";
import { initEnglishGame } from "./englishLogic";
import "./english.css";

export default function EnglishGamePage() {
  useEffect(() => {
    initEnglishGame();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <a href="/" className="back-btn" title="กลับหน้าหลัก">🏠</a>
            <span className="logo-icon">🔤</span>
            <div>
              <h1>ABC Animals</h1>
              <p className="tagline">เรียนรู้ตัวอักษร A ถึง Z</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="progress-wrap">
              <span className="progress-emoji" id="progress-emoji">⭐</span>
              <span className="progress-text"><span id="learned-count">0</span> / 26</span>
            </div>
            <button className="action-btn" id="btn-sound-toggle" title="เปิด/ปิดเสียง">🔊</button>
            <button className="action-btn reset-btn" id="btn-reset" title="เริ่มใหม่">🔄 เริ่มใหม่</button>
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="alphabet-grid" id="alphabet-grid"></div>
      </main>

      <div className="modal-overlay" id="letter-modal">
        <div className="modal-card" id="modal-card">
          <button className="modal-close" id="modal-close">×</button>

          <button className="nav-arrow left" id="btn-prev">‹</button>
          <button className="nav-arrow right" id="btn-next">›</button>

          <div className="modal-letter-top">
            <span className="modal-big-letter" id="modal-big-letter">A</span>
            <span className="modal-small-letter" id="modal-small-letter">a</span>
          </div>

          <div className="modal-animal-display" id="modal-animal-display"></div>

          <div className="modal-word-row">
            <span className="modal-word" id="modal-word">Ant</span>
          </div>

          <div className="modal-phonics" id="modal-phonics">"แอ-น-ท์"</div>

          <button className="speak-btn" id="btn-speak">
            <span className="speak-icon">🔊</span>
            <span>ฟังเสียง</span>
          </button>

          <div className="modal-star" id="modal-star">⭐ เรียนรู้แล้ว!</div>
        </div>
      </div>

      <div className="modal-overlay" id="victory-modal">
        <div className="victory-card">
          <div className="victory-ribbon">🎉 ยอดเยี่ยมมาก! 🎉</div>
          <div className="victory-big">🏆</div>
          <h2>เรียนครบ A-Z แล้ว!</h2>
          <p>เก่งมากๆ รู้จักตัวอักษรทุกตัวแล้ว!</p>
          <button className="victory-btn" id="btn-play-again">เล่นอีกรอบ 🔄</button>
        </div>
      </div>
    </div>
  );
}
