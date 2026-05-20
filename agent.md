# สรุปโปรเจกต์ Kids Game Zone (Next.js Version)

อัปเดตล่าสุด: **2026-05-21**

โปรเจกต์นี้ย้ายจากโครงสร้าง Static HTML/CSS/JS มาเป็น **Next.js (App Router)** เรียบร้อยแล้ว โดยคงพฤติกรรมเกมเดิมแบบ Hybrid (React UI + logic เดิมที่พอร์ตเข้า TypeScript)

---

## สถานะปัจจุบัน

- ย้าย Portal ไปที่ `src/app/page.tsx`
- ย้ายเกมครบ 6 เกมแล้ว
- ตั้งค่า PWA สำหรับ Next แล้ว (`public/manifest.json`, `public/service-worker.js`)
- Build ผ่าน (`npm run build`) ไม่มี build/type error

---

## โครงสร้างหลัก (Current)

```txt
kids_game/
├── AGENTS.md                    # กติกา agent
├── AGENT.md                     # สรุปสถานะโปรเจกต์ (ไฟล์นี้)
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   └── sounds/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── app/
│   │   ├── page.tsx             # Portal
│   │   ├── layout.tsx
│   │   └── games/
│   │       ├── jigsaw/
│   │       │   ├── page.tsx
│   │       │   ├── jigsaw.css
│   │       │   └── jigsawLogic.ts
│   │       ├── memory/
│   │       │   ├── page.tsx
│   │       │   ├── memory.css
│   │       │   └── memoryLogic.ts
│   │       ├── coloring/
│   │       │   ├── page.tsx
│   │       │   ├── coloring.css
│   │       │   └── coloringLogic.ts
│   │       ├── english/
│   │       │   ├── page.tsx
│   │       │   ├── english.css
│   │       │   └── englishLogic.ts
│   │       ├── word-match/
│   │       │   ├── page.tsx
│   │       │   ├── wordmatch.css
│   │       │   └── wordmatchLogic.ts
│   │       └── piano/
│   │           ├── page.tsx
│   │           ├── piano.css
│   │           └── pianoLogic.ts
│   └── components/
│       ├── GameHeader.tsx
│       └── Modal.tsx
└── vanilla_backup/              # สำรอง static เดิม
```

---

## รายชื่อเกมและเส้นทาง

1. จิ๊กซอว์สัตว์: `/games/jigsaw`
2. จับคู่ภาพสัตว์: `/games/memory`
3. ระบายสีเวทมนตร์: `/games/coloring`
4. ABC Animals: `/games/english`
5. จับคู่สัตว์คำศัพท์: `/games/word-match`
6. เปียโนเสียงสัตว์: `/games/piano`

---

## หมายเหตุเทคนิคสำคัญ

- Asset ทั้งหมดเรียกจาก `/assets/...` (อยู่ใน `public/assets`)
- เกม Coloring เพิ่ม guard และ cleanup ตอน unmount เพื่อลดปัญหา interval ทำงานค้าง
- เกมที่อาศัย DOM logic เดิม ใช้แนวทาง Hybrid ผ่าน `init*Game()` ใน `useEffect`
- Service Worker รองรับ route ของ Next App Router

---

## แนวทางทำงานต่อ (ถ้ามี)

- เก็บกวาด listener cleanup ให้ครบทุกเกม (เหมือนที่ทำใน Coloring)
- ทำ responsive tuning รายเกมต่ออุปกรณ์ tablet/mobile
- หลังยืนยันครบถ้วน สามารถพิจารณาลบ `vanilla_backup/` ได้
