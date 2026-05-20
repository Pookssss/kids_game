"use client";

import { useEffect } from "react";
import { initWordMatchGame } from "./wordmatchLogic";
import "./wordmatch.css";

export default function WordMatchPage() {
  useEffect(() => {
    initWordMatchGame();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <a href="/" className="back-btn">🏠</a>
            <span className="logo-icon">🔗</span>
            <div>
              <h1>จับคู่สัตว์</h1>
              <p className="tagline">Match the animal with its name!</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="score-pill" id="score-pill">
              <span className="score-icon">⭐</span>
              <span id="score-val">0</span>
              <span className="score-sep">/</span>
              <span id="score-total">0</span>
            </div>
            <div className="diff-bar">
              <button className="diff-pill active" data-pairs="3" id="diff-easy">🌟 ง่าย</button>
              <button className="diff-pill" data-pairs="5" id="diff-med">🔥 กลาง</button>
              <button className="diff-pill" data-pairs="8" id="diff-hard">💪 ยาก</button>
            </div>
            <button className="action-btn" id="btn-sound">🔊</button>
            <button className="action-btn" id="btn-new">🔄 ใหม่</button>
          </div>
        </div>
      </header>

      <main className="game-main" id="game-main">
        <section className="cards-section">
          <p className="section-label">🖼️ รูปภาพสัตว์</p>
          <div className="image-grid" id="image-grid"></div>
        </section>

        <div className="instruction instruction-middle" id="instruction">
          <span className="instr-icon">👆</span>
          <span id="instr-text">กดรูปภาพสัตว์ แล้วกดคำภาษาอังกฤษที่ตรงกัน!</span>
        </div>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-icon">🔗</span>
          <div className="divider-line"></div>
        </div>

        <section className="cards-section">
          <p className="section-label">🔤 คำภาษาอังกฤษ</p>
          <div className="word-grid" id="word-grid"></div>
        </section>
      </main>

      <div className="celebrate-overlay" id="celebrate-overlay">
        <div className="celebrate-emoji" id="celebrate-emoji">🎉</div>
      </div>

      <div className="modal-overlay" id="victory-modal">
        <div className="victory-card">
          <div className="victory-ribbon">🏆 ยอดเยี่ยม! 🏆</div>
          <div className="victory-big" id="victory-emoji-main">🌟</div>
          <h2>จับคู่ได้ครบแล้ว!</h2>
          <p id="victory-msg">เก่งมากๆ เลย!</p>
          <div className="victory-btns">
            <button className="v-btn primary" id="btn-next-round">ต่อไป ▶</button>
            <button className="v-btn secondary" id="btn-replay">เล่นอีกครั้ง 🔄</button>
          </div>
        </div>
      </div>
    </div>
  );
}
