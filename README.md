# BOQ บ้าน คสล. 2 ชั้น + ดาดฟ้า + สระว่ายน้ำ — เกาะพะงัน

| ส่วน | ใช้ทำอะไร | ใครเปิดได้ |
|---|---|---|
| `index.html` (GitHub Pages) | BOQ ฉบับดูอย่างเดียว + การ์ดคำนวณ 3D ทุกรายการ | ทุกคนที่มีลิงก์ ไม่ต้องลงชื่อ |
| `apps-script/` (Google Apps Script + Google Sheet) | เว็บแก้ไข BOQ + บันทึกเบิกค่าวัสดุ/ค่าแรง + คงเหลือ | ทุกคนที่มีลิงก์ดูได้ · แก้ไขต้องใส่รหัส (PIN) |

## ติดตั้งเว็บแก้ไข (ทำครั้งเดียว ~5 นาที)
1. เปิด Google Sheets → สร้างชีตใหม่ ตั้งชื่อ "BOQ บ้านสระว่ายน้ำ"
2. เมนู **ส่วนขยาย (Extensions) → Apps Script**
3. ลบโค้ดเดิมในไฟล์ `Code.gs` แล้ววางเนื้อหาจาก [`apps-script/Code.gs`](apps-script/Code.gs)
4. กด **+ → HTML** ตั้งชื่อ `Index` แล้ววางเนื้อหาจาก [`apps-script/Index.html`](apps-script/Index.html)
5. กดบันทึก → เลือกฟังก์ชัน `setup` → **Run** → อนุญาตสิทธิ์ (Review permissions → เลือกบัญชี → Advanced → Go to … → Allow)
6. **Deploy → New deployment → ⚙ Web app** · Execute as: **Me** · Who has access: **Anyone** → Deploy → คัดลอกลิงก์ Web app
7. รหัสแก้ไขเริ่มต้นคือ `1234` — เปลี่ยนได้: แก้ตัวเลขในฟังก์ชัน `setPin` แล้ว Run

ข้อมูลทั้งหมดอยู่ในแท็บ `db` ของ Google Sheet (สำรองข้อมูลได้ด้วย ไฟล์ → ทำสำเนา)
