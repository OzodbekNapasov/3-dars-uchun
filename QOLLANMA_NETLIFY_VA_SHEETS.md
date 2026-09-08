# O'QITUVCHI UCHUN TO'LIQ QO'LLANMA: GOOGLE SHEETS & NETLIFY

Ushbu qo'llanma orqali siz yaratilgan test platformasini o'zingiz taqdim etgan Google Sheets jadvalingizga ulab, Netlify tarmog'ida bepul ishga tushirishingiz mumkin.

---

## 1-QADAM: Sizning Google Sheets jadvalingizga ulanish (2 daqiqa)

Sizning maxsus jadvalingiz:  
**[3-dars testi — Google Sheets](https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit)**

1. Yuqoridagi havolani brauzeringizda oching.
2. Yuqori menyudan: **Kengaytmalar (Extensions)** -> **Apps Script** bo'limiga kiring.
3. Ochilgan kod tahrirlagichidagi barcha yozuvlarni o'chirib tashlang.
4. Loyihangizdagi **`google_sheets_script.gs`** faylidagi barcha kodni nusxalang (`Ctrl + A`, `Ctrl + C`) va Apps Script oynasiga qo'ying (`Ctrl + V`).
5. Yuqoridagi **Saqlash (Disketa belgisi / Ctrl + S)** tugmasini bosing.
6. O'ng yuqoridagi ko'k **Deploy (Joylashtirish)** -> **New deployment (Yangi joylashtirish)** bandini tanlang.
7. Chap tomondagi tishli g'ildirakcha (Select type) tugmasini bosing va **Web app** ni tanlang:
   - **Description:** `Test Natijalari`
   - **Execute as:** `Me (Mening nomimdan)`
   - **Who has access:** `Anyone (Har kim / Barcha)` <-- (Juda muhim! Har kim natija yubora olishi uchun shu tanlanishi shart)
8. **Deploy** tugmasini bosing:
   - Google hisobingizdan ruxsat so'raydi: **Authorize access** -> o'z akkauntingizni tanlang -> **Advanced** -> **Go to ... (unsafe)** -> **Allow** tugmalarini bosing.
9. Natijada sizga **Web app URL** beriladi:
   - Masalan: `https://script.google.com/macros/s/AKfycbx.../exec`
   - Shu havolani nusxalab (Copy qilib) oling.
10. Olingan havolani:
    - **A variant:** Loyihangizdagi **`js/config.js`** faylini ochib, `GOOGLE_SHEET_WEBAPP_URL: "SIZNING_HAVOLANGIZ"` qilib qo'ying.
    - **B variant:** Yoki `index.html` bosh sahifasini ochib, yuqori o'ng burchakdagi **Sozlamalar** tugmasini bosib, o'sha yerga qo'ying va "Saqlash"ni bosing.

---

## 2-QADAM: Netlify tarmog'iga bepul yuklash (Deploy qilish) (1 daqiqa)

1. [app.netlify.com/drop](https://app.netlify.com/drop) saytiga kiring.
2. Agar hisobingiz bo'lmasa, Email yoki Google orqali kiring.
3. Ekranda **"Drag and drop your site folder here"** maydoni ko'rinadi.
4. Ish stolidagi **`3-dars`** papkasini sichqoncha bilan ushlab, shu maydon ichiga sudrab tashlang (Drag & Drop).
5. 10-15 soniyada Netlify sizga sayt havolasini yaratib beradi:
   - Masalan: `https://3-dars-testi.netlify.app`
6. Ushbu tayyor havolani talabalaringizga yuborasiz!

---

## 3-QADAM: Yangi imkoniyatlar va himoyalar

- **Bir ekranga moslangan dizayn:** Talaba ma'lumotlarini kiritish sahifasi ham, test topshirish sahifasi ham vertikal surilmasdan (scrolling bo'lmasdan) to'liq bitta ekranga sig'adi.
- **To'liq ekran (Fullscreen) majburiy rejimi:** Test boshlanganda avtomatik to'liq ekran rejimiga kiradi. Agar talaba to'liq ekrandan chiqishga urinsa, darhol ogohlantirish oynasi ochiladi va qaytaradi.
- **Cheaterlikdan (ko'chirishdan) himoya:**
  - Matnlarni belgilash (select) o'chirilgan.
  - Sichqonchaning o'ng tugmasi (context menu) bloklangan.
  - Nusxa olish (Ctrl+C, Ctrl+P, Ctrl+U, Ctrl+S) va dasturchi konsoli (F12) bloklangan.
  - Skrinshot olish (PrintScreen) tugmasi tutib olinadi va bufer tozalanadi.
  - Boshqa brauzer oynasiga yoki ilovaga o'tish (Tab switch) qayd qilinadi va ogohlantirish chiqariladi.
- **Tugmalar tartibi:**
  - **Testni yakunlash** tugmasi yuqoriga (header paneliga) ko'chirilgan, bu esa savollarni yechish vaqtida bilmasdan bosib yuborishning oldini oladi.
  - Pastda esa faqat **Oldingi** va **Keyingi** navigatsiya tugmalari joylashgan.
- **SVG piktogrammalar:** Tizimda hech qanday emoji ishlatilmagan, barcha belgilar toza va sifatli SVG formatda yaratilgan.
