# Kids Game Zone (Next.js)

Kids Game Zone คือคลังเกมสำหรับเด็กเล็กอายุ 2-5 ปี ที่ย้ายจาก Static HTML/CSS/JS มาเป็น Next.js (App Router) โดยยังคงพฤติกรรมเกมเดิมไว้ด้วยแนวทาง Hybrid (React UI + game logic เดิมที่พอร์ตเป็น TypeScript)

อัปเดตล่าสุด: 2026-05-21

## สถานะโปรเจกต์

- ย้าย Portal สำเร็จ (`src/app/page.tsx`)
- ย้ายเกมครบ 6 เกมแล้ว
- ตั้งค่า PWA สำหรับ Next.js แล้ว (`public/manifest.json`, `public/service-worker.js`)
- Build ผ่าน (`npm run build`)

## เกมทั้งหมด

1. จิ๊กซอว์สัตว์: `/games/jigsaw`
2. จับคู่ภาพสัตว์: `/games/memory`
3. ระบายสีเวทมนตร์: `/games/coloring`
4. ABC Animals: `/games/english`
5. จับคู่สัตว์คำศัพท์: `/games/word-match`
6. เปียโนเสียงสัตว์: `/games/piano`

## โครงสร้างหลัก

```txt
kids_game/
├── AGENTS.md
├── AGENT.md
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   └── sounds/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── games/
│   │       ├── jigsaw/
│   │       ├── memory/
│   │       ├── coloring/
│   │       ├── english/
│   │       ├── word-match/
│   │       └── piano/
│   └── components/
└── vanilla_backup/
```

## การติดตั้งและรัน

```bash
npm install
npm run dev
```

เปิดที่ `http://localhost:3000`

## คำสั่งที่ใช้บ่อย

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## หมายเหตุเทคนิค

- Asset ทั้งหมดเรียกผ่าน `/assets/...` จาก `public/assets`
- เกม Coloring เพิ่ม guard + cleanup ตอน unmount เพื่อกัน interval ค้าง
- เกมที่ยังใช้ DOM logic เดิมเรียกผ่าน `init*Game()` ภายใน `useEffect`
- Service Worker รองรับเส้นทางแบบ Next App Router

## หมายเหตุสำหรับการย้ายระบบ

- โค้ด Static เดิมเก็บไว้ที่ `vanilla_backup/` สำหรับอ้างอิง
- เมื่อตรวจสอบครบถ้วนแล้ว ค่อยพิจารณาลบ `vanilla_backup/`
