# Lanna EcoSync — เว็บไซต์หลายหน้า (GitHub Pages Ready)

สร้างต่อจากไฟล์ Lanna-EcoSync-V3-Standalone (2).html ที่ผู้ใช้เลือก โดยไม่ออกแบบโลโก้หรือสินค้าใหม่

## หน้าเว็บ
- index.html: ศูนย์รวมเมนูบริการ / หน้าแรก
- about.html: เรื่องราวชุมชนและภาพกิจกรรม
- market.html: ตลาดสินค้า + สั่งจอง
- studio.html: B2B Studio สกรีน / สติกเกอร์ ใส่โลโก้บนถ้วย
- carbon.html: เครื่องคำนวณคาร์บอน (สมมติฐาน)
- booking.html: ปฏิทินและคำขอจองโรงอบ
- admin.html: หลังบ้านผู้ขาย + จัดการคิว

## การเผยแพร่ GitHub Pages
1. เข้า repository ของคุณ เช่น mon1206/lanna-ecosync และเลือก `main` branch
2. **อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดจาก ZIP นี้** ลงที่ root โดยเฉพาะ `index.html`, หน้า `.html` อื่น ๆ, `script.js`, `style.css`, และ `assets/`
3. ตั้งค่า Settings > Pages > Deploy from a branch > main > /(root)
4. รอให้ deployment เสร็จแล้วเปิด `https://mon1206.github.io/lanna-ecosync/`
5. ลิงก์แต่ละหน้าเช่น `/market.html`, `/studio.html` และ `/booking.html` จะแยกกันจริง

**ไม่อัปโหลด ZIP เข้า repository โดยตรง** GitHub ไม่แตกไฟล์ ZIP ให้อัตโนมัติ

## บัญชีทดสอบ
- seller@lanna.demo / seller123
- buyer@lanna.demo / buyer123

## ข้อจำกัดระบบเดโม
- เก็บข้อมูลที่ localStorage ของแต่ละเบราว์เซอร์ ไม่ใช่ฐานข้อมูลร่วมกันระหว่างเพื่อน
- ระบบเข้าสู่ระบบใน JavaScript เป็นเพียงสาธิต ไม่ปลอดภัยสำหรับข้อมูลจริง และไม่ใช่ระบบล็อกอิน production
- ราคาสินค้า สต็อก ค่าคาร์บอน และผลการจองเป็นข้อมูลจำลอง
- สำหรับเปิดใช้งานกับผู้ใช้จริงต้องมี backend + database + authentication + authorization
