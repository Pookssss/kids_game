"use client";

import Link from "next/link";

const AudioSynth = {
  ctx: null as AudioContext | null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  },
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  },
};

export default function PortalPage() {
  const handleMouseEnter = () => AudioSynth.playPop();
  const handleClick = () => AudioSynth.playClick();

  return (
    <>
      {/* Floating bubbles background */}
      <div className="bubbles-bg" aria-hidden="true">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      <div className="portal-container">
        {/* Header */}
        <header className="portal-header">
          <div className="portal-logo">
            <span className="portal-logo-icon">🌟</span>
            <div>
              <h1>Kids Game Zone</h1>
              <p className="portal-tagline">เกมสนุกสำหรับเด็กน้อย 🎈</p>
            </div>
          </div>
          <div className="portal-stars">⭐️ ⭐️ ⭐️</div>
        </header>

        {/* Game Cards Grid */}
        <main className="games-grid" id="games-grid">
          {/* Jigsaw Puzzle */}
          <Link
            href="/games/jigsaw"
            className="game-card"
            id="card-jigsaw"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมต่อจิ๊กซอว์สัตว์แสนสนุก"
          >
            <div className="card-badge">⭐ ยอดนิยม</div>
            <div className="card-icon-wrap jigsaw-bg">
              <span className="card-big-icon">🧩</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">จิ๊กซอว์สัตว์</h2>
              <p className="card-desc">ต่อชิ้นส่วนให้ครบ แล้วเห็นภาพสัตว์น่ารัก!</p>
              <div className="card-tags">
                <span className="tag">🔢 4–81 ชิ้น</span>
                <span className="tag">👶 อายุ 2+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>

          {/* Memory Match */}
          <Link
            href="/games/memory"
            className="game-card"
            id="card-memory"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมจับคู่ภาพสัตว์"
          >
            <div className="card-icon-wrap memory-bg">
              <span className="card-big-icon">🃏</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">จับคู่ภาพสัตว์</h2>
              <p className="card-desc">พลิกไพ่แล้วหาคู่ที่เหมือนกัน ฝึกความจำ!</p>
              <div className="card-tags">
                <span className="tag">🧠 ฝึกความจำ</span>
                <span className="tag">👶 อายุ 3+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>

          {/* Magic Coloring */}
          <Link
            href="/games/coloring"
            className="game-card"
            id="card-coloring"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมระบายสีเวทมนตร์"
          >
            <div className="card-icon-wrap coloring-bg">
              <span className="card-big-icon">🎨</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">ระบายสีเวทมนตร์</h2>
              <p className="card-desc">ลากนิ้วแล้วภาพสัตว์จะค่อยๆ ปรากฏขึ้นมา!</p>
              <div className="card-tags">
                <span className="tag">✨ เวทมนตร์</span>
                <span className="tag">👶 อายุ 2+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>

          {/* ABC Animals English */}
          <Link
            href="/games/english"
            className="game-card"
            id="card-english"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมเรียนภาษาอังกฤษ ABC"
          >
            <div className="card-badge new-badge">🆕 ใหม่!</div>
            <div className="card-icon-wrap english-bg">
              <span className="card-big-icon">🔤</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">ABC Animals</h2>
              <p className="card-desc">เรียนรู้ตัวอักษร A-Z พร้อมเสียงออกเสียงจริง!</p>
              <div className="card-tags">
                <span className="tag">🔊 ฟังเสียง</span>
                <span className="tag">👶 อายุ 2+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>

          {/* Animal Word-Match */}
          <Link
            href="/games/word-match"
            className="game-card"
            id="card-wordmatch"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมจับคู่สัตว์ภาษาอังกฤษ"
          >
            <div className="card-badge new-badge">🆕 ใหม่!</div>
            <div className="card-icon-wrap wordmatch-bg">
              <span className="card-big-icon">🧩</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">จับคู่สัตว์</h2>
              <p className="card-desc">จับคู่รูปสัตว์กับชื่ออังกฤษ!</p>
              <div className="card-tags">
                <span className="tag">🔤 ภาษาอังกฤษ</span>
                <span className="tag">👶 อายุ 2+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>

          {/* Animal Piano */}
          <Link
            href="/games/piano"
            className="game-card"
            id="card-piano"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            aria-label="เกมเปียโนเสียงสัตว์แสนสนุก"
          >
            <div className="card-badge new-badge">🆕 ใหม่!</div>
            <div className="card-icon-wrap piano-bg">
              <span className="card-big-icon">🎹</span>
            </div>
            <div className="card-info">
              <h2 className="card-title">เปียโนเสียงสัตว์</h2>
              <p className="card-desc">เล่นโน้ตเพลงและสนุกกับเสียงสัตว์น่ารัก!</p>
              <div className="card-tags">
                <span className="tag">🎵 เสียงดนตรี</span>
                <span className="tag">👶 อายุ 2+</span>
              </div>
            </div>
            <div className="card-play-btn">เล่นเลย! 🎮</div>
          </Link>
        </main>

        {/* Footer */}
        <footer className="portal-footer">
          <p>🌈 ออกแบบมาเพื่อเด็กน้อยอายุ 2–5 ปี • เล่นได้บน iPad, Tablet และ PC</p>
        </footer>
      </div>
    </>
  );
}
