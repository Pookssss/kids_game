# 🎮 Kids Game Zone

**เว็บแอปคลังเกมสำหรับเด็กเล็กอายุ 2-5 ปี** — เรียนรู้ เพลิดเพลิน และพัฒนาการผ่านเกม 6 เกมสนุกสนาน ไม่ต้องติดตั้ง เล่นได้ทันทีผ่านเบราว์เซอร์

---

## 🕹️ เกมทั้งหมด

| # | เกม | คำอธิบาย | ทักษะที่พัฒนา |
|---|-----|-----------|--------------|
| 1 | 🧩 **จิ๊กซอว์สัตว์** | ต่อชิ้นส่วนภาพสัตว์ 4 ระดับ | การมองเห็น, ความอดทน |
| 2 | 🃏 **จับคู่ภาพสัตว์** | พลิกการ์ดจับคู่ให้ครบ | ความจำ, สมาธิ |
| 3 | 🎨 **ระบายสีเวทมนตร์** | ปัดหมอกให้รูปสัตว์ปรากฏ | ทักษะมือ, ความคาดเดา |
| 4 | 🔤 **ABC Animals** | เรียนรู้ตัวอักษร A-Z กับสัตว์ | ภาษาอังกฤษ, การฟัง |
| 5 | 🔗 **จับคู่คำศัพท์** | จับคู่ภาพกับคำภาษาอังกฤษ | คำศัพท์, การจดจำ |
| 6 | 🎹 **เปียโนเสียงสัตว์** | กดเปียโนฟังเสียงร้องสัตว์จริง | ดนตรี, ความสัมพันธ์เสียง |

---

## ✨ ไฮไลท์ฟีเจอร์

### 🎹 เกมเปียโนเสียงสัตว์
- **เสียงสัตว์จริง** จากไฟล์ MP3 ที่บันทึกจริง (ไม่ใช่ Text-to-Speech)
- **3 โหมดเสียง**: เปียโนสังเคราะห์ / เสียงสัตว์ / มิกซ์ทั้งคู่
- **ระบบฝึกเล่นตามเพลง** พร้อม Song Guide Panel แสดงโน้ตถัดไปแบบ Visual
  - Block สีใหญ่แสดงสีและชื่อโน้ตที่ต้องกด
  - จุดสีเรียงลำดับโน้ตถัดไป 12 จุด
  - ลูกศร 👇 กระพริบบนคีย์ที่ต้องกด
- **เพิ่มจำนวนรอบ** ได้ตามต้องการ (1-10 รอบ)
- เพลงในระบบ: Twinkle Twinkle ⭐, Mary Had a Little Lamb 🐑, Jingle Bells 🔔

---

## 🛠️ เทคโนโลยี

- **Pure HTML + CSS + JavaScript** — ไม่มี Framework, ไม่มี Build Step
- **Web Audio API** — สร้างเสียงดนตรีสังเคราะห์คุณภาพดี
- **Canvas API** — ระบบ Pixel Analyzer สำหรับเกมระบายสี
- **CSS Animations** — Particle, Bounce, Glow, Glassmorphism
- **Google Fonts** (Fredoka, Noto Sans Thai) — ฟอนต์น่ารักสำหรับเด็ก

---

## 📁 โครงสร้างไฟล์

```
kids_game/
├── index.html          ← หน้า Portal เลือกเกม
├── style.css           ← CSS หน้า Portal
├── vercel.json         ← Vercel Deploy Config
├── assets/
│   ├── images/         ← รูปสัตว์ (PNG)
│   └── sounds/         ← เสียงสัตว์จริง (MP3)
│       ├── cat.mp3, dog.mp3, elephant.mp3
│       ├── chicken.mp3, duck.mp3, frog.mp3
│       ├── monkey.mp3, lion.mp3
└── games/
    ├── jigsaw/
    ├── memory/
    ├── coloring/
    ├── english/
    ├── word-match/
    └── piano/
```

---

## 🚀 วิธีรันในเครื่อง

### ง่ายที่สุด — VS Code Live Server
1. เปิดโฟลเดอร์ `kids_game/` ใน VS Code
2. ติดตั้ง Extension **Live Server** (ritwickdey.LiveServer)
3. คลิกขวาที่ `index.html` → **Open with Live Server**
4. เปิด `http://127.0.0.1:5500` ในเบราว์เซอร์

### Python HTTP Server
```bash
cd kids_game
python -m http.server 3000
# เปิด http://localhost:3000
```

---

## 🌐 Deploy บน Vercel

### วิธีที่ 1: Dashboard
1. Push โปรเจกต์ขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) → New Project → Import
3. Framework = **Other** (Static)
4. กด **Deploy**

### วิธีที่ 2: CLI
```bash
npm i -g vercel
cd kids_game
vercel --prod
```

> ⚡ Deploy ง่ายมาก เพราะเป็น Static HTML ล้วน ไม่มี Build Process

---

## 🎯 กลุ่มเป้าหมาย

- เด็กเล็กอายุ **2-5 ปี**
- เน้นเกมที่ **สร้างสรรค์** ไม่มีการแข่งขันหรือแพ้
- ออกแบบให้ **ผู้ปกครองเล่นร่วมกับเด็ก** ได้อย่างสนุกสนาน

---

## 📄 License

ไฟล์เสียงสัตว์ที่บันทึกเอง — สงวนสิทธิ์  
Source code — MIT License
