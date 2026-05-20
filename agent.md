# สรุปผลงานการพัฒนา Kids Game Zone (Multi-Game Hub)

อัปเดตล่าสุด: **2026-05-21** — โปรเจกต์ได้รับการพัฒนาจากเกมจิ๊กซอว์เดี่ยวเป็น **คลังเกม 6 เกมแสนสนุก** สำหรับเด็กเล็กอายุ 2-5 ปี พร้อมระบบ Portal หน้าหลักและพร้อม Deploy บน **Vercel**

---

## 🗂️ โครงสร้างโปรเจกต์ (Project Structure)

```
kids_game/
├── index.html              ← 🏠 หน้า Portal (เลือกเกม 6 เกม)
├── style.css               ← ✨ Portal CSS (Responsive Auto-fit Grid)
├── vercel.json             ← 🚀 Vercel Deploy Config
├── agent.md                ← 📋 ไฟล์สรุปนี้
├── README.md               ← 📖 คู่มือสำหรับ GitHub
├── assets/
│   ├── images/             ← 🖼️ รูปสัตว์ 8 ชนิด (ใช้ร่วมกันทุกเกม)
│   │   ├── cute_panda.png
│   │   ├── cute_lion.png
│   │   ├── cute_elephant.png
│   │   ├── cute_fox.png
│   │   ├── cute_cat.png
│   │   ├── cute_koala.png
│   │   ├── cute_rabbit.png
│   │   └── cute_monkey.png
│   └── sounds/             ← 🔊 เสียงสัตว์จริง 8 ไฟล์ (ใช้ในเกมเปียโน)
│       ├── cat.mp3
│       ├── dog.mp3
│       ├── elephant.mp3
│       ├── chicken.mp3
│       ├── duck.mp3
│       ├── frog.mp3
│       ├── monkey.mp3
│       └── lion.mp3
└── games/
    ├── jigsaw/             ← 🧩 เกม 1: ต่อจิ๊กซอว์สัตว์แสนสนุก
    ├── memory/             ← 🃏 เกม 2: จับคู่ภาพสัตว์ (Memory Match)
    ├── coloring/           ← 🎨 เกม 3: ระบายสีเวทมนตร์ (Magic Coloring)
    ├── english/            ← 🔤 เกม 4: ABC Animals (เรียนรู้ตัวอักษร A-Z)
    ├── word-match/         ← 🔗 เกม 5: จับคู่สัตว์ (Animal Word-Match)
    └── piano/              ← 🎹 เกม 6: เปียโนเสียงสัตว์ (Animal Sound Piano)
        ├── index.html
        ├── style.css
        └── game.js
```

---

## 🏠 หน้า Portal (index.html + style.css)

หน้าหลักสไตล์การ์ตูนสุดสดใสสำหรับเลือกเกม:
- **พื้นหลังเคลื่อนไหว**: ไล่โทนสีพร้อมเอฟเฟกต์ฟองอากาศลอยละล่อง
- **การ์ดเกม 6 ใบ**: ดีไซน์ Glassmorphism ลอยขึ้นเมื่อ Hover
- **ระบบเสียงโต้ตอบ**: เสียง Pop เมื่อเมาส์จ่อ, Click เมื่อเลือก
- **Responsive**: Grid `auto-fit` รองรับทุกขนาดหน้าจอ

---

## 🧩 เกม 1: จิ๊กซอว์สัตว์แสนสนุก (Jigsaw Puzzle)
**Path:** `games/jigsaw/`
- ระดับความยาก 4 ระดับ (4-81 ชิ้น)
- มีระบบ Parent Gate (โจทย์คณิต) ก่อนระดับยาก
- ตัดภาพสัตว์แบ่งชิ้นส่วนแบบไดนามิก

---

## 🃏 เกม 2: จับคู่ภาพสัตว์ (Memory Match)
**Path:** `games/memory/`
- พลิกการ์ด 3D จับคู่ภาพสัตว์ที่ซ่อนอยู่
- นับคะแนน/เวลา, ปรับระดับ 4-8 คู่

---

## 🎨 เกม 3: ระบายสีเวทมนตร์ (Magic Coloring)
**Path:** `games/coloring/`
- ลากนิ้วปัดหมอกสีเทาให้รูปสัตว์ปรากฏ
- Pixel Analyzer คำนวณ % บน Canvas แบบเรียลไทม์ ชนะเมื่อ > 72%

---

## 🔤 เกม 4: ABC Animals — เรียนอักษร A-Z
**Path:** `games/english/`
- การ์ด A-Z พร้อมภาพสัตว์น่ารัก
- คลิกฟังเสียงออกเสียงจาก Web Speech API
- บันทึกตัวอักษรที่เรียนแล้ว (⭐ ในบอร์ด), ปุ่มนำทาง ซ้าย/ขวา

---

## 🔗 เกม 5: จับคู่สัตว์ (Animal Word-Match)
**Path:** `games/word-match/`
- ลาก/คลิกจับคู่ภาพสัตว์กับคำศัพท์ภาษาอังกฤษ
- คู่สำเร็จเรืองแสงพร้อมออกเสียงอ่านทันที
- คู่ผิดสั่น (Shake Animation) พร้อมขอบสีแดง

---

## 🎹 เกม 6: เปียโนเสียงสัตว์แสนสนุก (Animal Sound Piano)
**Path:** `games/piano/`

### ฟีเจอร์หลัก
- **คีย์บอร์ด 8 คีย์สีรุ้ง** (C4–C5: โด เร มี ฟา ซอล ลา ที โด๊)
- **โหมดเสียง 3 แบบ**:
  - 🎹 เปียโน (Synth oscillator, warm triangle+sine wave)
  - 🐾 เสียงร้อง — ใช้ **ไฟล์ MP3 จริง** (`assets/sounds/*.mp3`) ไม่ใช่ Text-to-Speech อีกต่อไป
  - ✨ มิกซ์ (Synth + เสียงสัตว์พร้อมกัน)
- **Preload + cloneNode**: โหลดเสียงล่วงหน้าทั้ง 8 ไฟล์, ใช้ `cloneNode()` เพื่อรองรับการกดรัวๆ โดยไม่ตัดเสียง
- **playbackRate ตามโน้ต**: C4 = 0.80×, C5 = 1.40× ทำให้เสียงสัตว์ผันตามระดับเสียงของโน้ต
- **เวทีโชว์สัตว์**: กดคีย์ → สัตว์กระโดดเด้งพร้อมฟองอากาศภาษาไทย
- **Particle ดนตรี**: ดาวและโน้ตพวยพุ่งจากคีย์ที่กด

### ระบบฝึกเล่นตามเพลง (Song Guide)
- เพลงในระบบ: Twinkle Twinkle Little Star, Mary Had a Little Lamb, Jingle Bells
- **Song Guide Panel** (ใหม่): กล่องแสดงข้อมูลโน้ตถัดไปแบบ Big Visual
  - **Block สีใหญ่** 96×96px ไฮไลท์ด้วยสีตรงกับคีย์ที่ต้องกด + emoji สัตว์ + ชื่อโน้ตไทย
  - **Sequence Dots**: จุดสีวงกลมเรียงแสดงโน้ตถัดไป 12 จุด จุดปัจจุบันขยายใหญ่, จุดที่กดแล้วจางลง
- **Dynamic Hint Bar**: ข้อความ "กดปุ่มสี 🔴 มี (E) นะจ๊ะ!" เปลี่ยนสีวงกลมและชื่อโน้ตอัตโนมัติตามโน้ตจริง (ไม่ใช่ "สีส้ม" ตายตัวอีกต่อไป)
- **Highlight โน้ตบนคีย์บอร์ด** (ปรับปรุง): Glow สว่างด้วยสีของคีย์นั้น + ลูกศร 👇 กระพริบบนคีย์ + ขยายตัว scale 1.06×
- **Animal Stage หดตัว**: เมื่อเล่นตามเพลง พื้นที่สัตว์จะเล็กลงเพื่อให้ Guide Panel มีพื้นที่มากขึ้น
- **ปุ่มเพิ่ม/ลดรอบ (+/−)**: กำหนดจำนวนรอบที่ต้องเล่น (1-10 รอบ) ตัวนับความคืบหน้าจะรวมทุกรอบ
- **Victory Modal**: แสดงหน้าจอ "ยินดีด้วย!" พร้อม fanfare เสียงดนตรีเมื่อครบทุกรอบ

### ไฟล์เสียงสัตว์ (assets/sounds/)
| ไฟล์ | สัตว์ | คีย์ |
|------|-------|------|
| `cat.mp3` | 🐱 แมว | C (โด) |
| `dog.mp3` | 🐶 สุนัข | D (เร) |
| `elephant.mp3` | 🐘 ช้าง | E (มี) |
| `chicken.mp3` | 🐥 ลูกเจี๊ยบ | F (ฟา) |
| `duck.mp3` | 🦆 เป็ด | G (ซอล) |
| `frog.mp3` | 🐸 กบ | A (ลา) |
| `monkey.mp3` | 🐵 ลิง | B (ที) |
| `lion.mp3` | 🦁 สิงโต | C' (โด๊) |

---

## 🚀 วิธี Deploy บน Vercel

### วิธีที่ 1: Vercel Dashboard (แนะนำ)
1. Push โฟลเดอร์ `kids_game/` ขึ้น **GitHub**
2. เข้า [vercel.com](https://vercel.com) → New Project → Import Repository
3. ตั้ง **Root Directory** = `kids_game`
4. Framework Preset = **Other** (Static HTML)
5. กด **Deploy** ✅

### วิธีที่ 2: Vercel CLI
```bash
npm i -g vercel
cd c:\Users\P\Desktop\kids_game
vercel --prod
```

### `vercel.json` (Cache Policy)
- Cache `assets/` นาน 1 ปี (immutable)
- Cache `.js` และ `.css` นาน 1 วัน
- ไม่ต้องการ Build Step (Static HTML/CSS/JS)

---

## 📝 Notes สำหรับ Agent รุ่นต่อไป

- ไฟล์เสียงอยู่ที่ `assets/sounds/*.mp3` — ชื่อไฟล์ต้องตรงกับ mapping ใน `game.js` (`soundFile` field)
- `chicken.mp3` ↔ สัตว์ชื่อ `chick` ในโค้ด (ตั้งใจ)
- Song Guide Panel DOM IDs: `song-guide-panel`, `sgp-note-block`, `sgp-note-emoji`, `sgp-note-letter`, `sgp-note-solfege`, `sgp-sequence`
- CSS class `.song-mode` บน `.game-main` — toggle โดย JS เมื่อเลือกเพลง (ย่อ animal-stage)
- `keyColors[]` และ `keyLabels[]` ใน `game.js` ต้องสอดคล้องกับ `--key-color` ใน HTML
