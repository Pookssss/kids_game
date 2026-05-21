"use client";

import { useEffect } from "react";
import { initPianoGame } from "./pianoLogic";
import "./piano.css";

export default function PianoPage() {
  useEffect(() => {
    initPianoGame();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <a href="/" className="back-btn">🏠</a>
            <span className="logo-icon">🎹</span>
            <div>
              <h1>เปียโนเสียงสัตว์</h1>
              <p className="tagline">Play music with your animal friends!</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="mode-bar">
              <button className="mode-pill active" data-mode="synth" id="mode-synth">🎹 เปียโน</button>
              <button className="mode-pill" data-mode="animal" id="mode-animal">🐱 เสียงร้อง</button>
              <button className="mode-pill" data-mode="mix" id="mode-mix">✨ มิกซ์</button>
            </div>

            <button className="mode-pill" id="btn-sound-toggle" title="เปิด/ปิดเสียง">🔊</button>

            <div className="song-selector-wrap">
              <select id="song-select" className="song-select" defaultValue="free">
                <option value="free">🎵 เล่นตามใจชอบ</option>
                <option value="twinkle">⭐ Twinkle Twinkle</option>
                <option value="mary">🐑 Mary Had a Little Lamb</option>
                <option value="jingle">🔔 Jingle Bells</option>
                <option value="happy">👏 If You're Happy</option>
                <option value="oldmac">🐮 Old MacDonald</option>
                <option value="row">🚣 Row Row Row Your Boat</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="song-helper" id="song-helper" style={{ display: "none" }}>
          <span className="helper-icon">💡</span>
          <div className="helper-text-wrap">
            <p className="song-title-label" id="song-title-label">เพลง: Twinkle Twinkle</p>
            <p className="song-guide-notes">กดปุ่มสี <span id="guide-color-swatch" className="guide-color-swatch"></span> <strong id="guide-key-name">?</strong> นะจ๊ะ!</p>
          </div>
          <div className="song-controls-wrap">
            <div className="repeat-control">
              <span className="repeat-label">รอบ</span>
              <button className="repeat-btn" id="btn-repeat-minus" aria-label="ลดรอบ">-</button>
              <span className="repeat-count" id="repeat-count">1</span>
              <button className="repeat-btn" id="btn-repeat-plus" aria-label="เพิ่มรอบ">+</button>
            </div>
            <div className="song-progress" id="song-progress">0/14</div>
          </div>
        </div>

        <div className="song-guide-panel" id="song-guide-panel" style={{ display: "none" }}>
          <div className="sgp-next-label">กดโน้ตนี้ถัดไป 👇</div>
          <div className="sgp-note-block" id="sgp-note-block">
            <span className="sgp-note-emoji" id="sgp-note-emoji">🐱</span>
            <span className="sgp-note-letter" id="sgp-note-letter">C</span>
            <span className="sgp-note-solfege" id="sgp-note-solfege">โด</span>
          </div>
          <div className="sgp-sequence" id="sgp-sequence"></div>
        </div>

        <section className="animal-stage">
          <div className="stage-animal" data-key="0" id="animal-0"><div className="bubble-speech" id="speech-0">เหมียว!</div><span className="stage-emoji">🐱</span><span className="stage-name">Cat</span></div>
          <div className="stage-animal" data-key="1" id="animal-1"><div className="bubble-speech" id="speech-1">โฮ่ง!</div><span className="stage-emoji">🐶</span><span className="stage-name">Dog</span></div>
          <div className="stage-animal" data-key="2" id="animal-2"><div className="bubble-speech" id="speech-2">แปร๋น!</div><span className="stage-emoji">🐘</span><span className="stage-name">Elephant</span></div>
          <div className="stage-animal" data-key="3" id="animal-3"><div className="bubble-speech" id="speech-3">เจี๊ยบ!</div><span className="stage-emoji">🐥</span><span className="stage-name">Chick</span></div>
          <div className="stage-animal" data-key="4" id="animal-4"><div className="bubble-speech" id="speech-4">ก๊าบ!</div><span className="stage-emoji">🦆</span><span className="stage-name">Duck</span></div>
          <div className="stage-animal" data-key="5" id="animal-5"><div className="bubble-speech" id="speech-5">อบๆ!</div><span className="stage-emoji">🐸</span><span className="stage-name">Frog</span></div>
          <div className="stage-animal" data-key="6" id="animal-6"><div className="bubble-speech" id="speech-6">เจี๊ยก!</div><span className="stage-emoji">🐵</span><span className="stage-name">Monkey</span></div>
          <div className="stage-animal" data-key="7" id="animal-7"><div className="bubble-speech" id="speech-7">โฮก!</div><span className="stage-emoji">🦁</span><span className="stage-name">Lion</span></div>
        </section>

        <section className="piano-keyboard">
          <button className="piano-key" data-note="C4" data-index="0" style={{ ["--key-color" as any]: "#ff6b6b" }} aria-label="Key C"><span className="key-note">C</span><span className="key-solfege">โด</span><span className="key-small-emoji">🐱</span></button>
          <button className="piano-key" data-note="D4" data-index="1" style={{ ["--key-color" as any]: "#ffa502" }} aria-label="Key D"><span className="key-note">D</span><span className="key-solfege">เร</span><span className="key-small-emoji">🐶</span></button>
          <button className="piano-key" data-note="E4" data-index="2" style={{ ["--key-color" as any]: "#ffd23f" }} aria-label="Key E"><span className="key-note">E</span><span className="key-solfege">มี</span><span className="key-small-emoji">🐘</span></button>
          <button className="piano-key" data-note="F4" data-index="3" style={{ ["--key-color" as any]: "#10ac84" }} aria-label="Key F"><span className="key-note">F</span><span className="key-solfege">ฟา</span><span className="key-small-emoji">🐥</span></button>
          <button className="piano-key" data-note="G4" data-index="4" style={{ ["--key-color" as any]: "#0984e3" }} aria-label="Key G"><span className="key-note">G</span><span className="key-solfege">ซอล</span><span className="key-small-emoji">🦆</span></button>
          <button className="piano-key" data-note="A4" data-index="5" style={{ ["--key-color" as any]: "#6c5ce7" }} aria-label="Key A"><span className="key-note">A</span><span className="key-solfege">ลา</span><span className="key-small-emoji">🐸</span></button>
          <button className="piano-key" data-note="B4" data-index="6" style={{ ["--key-color" as any]: "#a29bfe" }} aria-label="Key B"><span className="key-note">B</span><span className="key-solfege">ที</span><span className="key-small-emoji">🐵</span></button>
          <button className="piano-key" data-note="C5" data-index="7" style={{ ["--key-color" as any]: "#fd79a8" }} aria-label="Key High C"><span className="key-note">C'</span><span className="key-solfege">โด๊</span><span className="key-small-emoji">🦁</span></button>
        </section>
      </main>

      <div className="particle-container" id="particle-container" aria-hidden="true"></div>

      <div className="modal-overlay" id="victory-modal">
        <div className="victory-card">
          <div className="victory-ribbon">🎵 เล่นจบเพลงแล้ว! 🏆</div>
          <div className="victory-big">🎉🐱🦁🐘🎉</div>
          <h2>ยินดีด้วยจ้า!</h2>
          <p>น้องๆ บรรเลงเพลงได้ยอดเยี่ยมมากเลย!</p>
          <div className="victory-btns">
            <button className="v-btn primary" id="btn-next-song">เล่นอีกครั้ง 🔄</button>
          </div>
        </div>
      </div>
    </div>
  );
}
