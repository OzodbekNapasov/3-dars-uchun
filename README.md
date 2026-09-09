# 3-Dars: Axborot Texnologiyalari — Amaliyot va Test Platformasi hamda Admin Panel

Tibbiyot texnikumi 1-kurs talabalari uchun **Axborotning o'lchov birliklari** va **Sanoq sistemalari** (2-lik va 10-lik) mavzulari bo'yicha interaktiv o'quv, hisoblash amaliyoti va test platformasi.

---

## Asosiy Imkoniyatlar

### 1. Talaba Platformasi (`index.html`):
- **Guruhlar tanlovi:** `26-01`, `26-02`, `26-03`, `26-04`, `26-05`, `26-06`, `26-07` guruhlari ro'yxatdan o'tishda tanlanadi.
- **4 ta Bosqichli struktura:**
  1. **1-Bo'lim:** Axborot o'lchov birliklari — **10 ta** misol, har biri bitta amal bilan yechiladi (masalan: `7 KB = ? B`).
  2. **2-Bo'lim:** 2-likdan 10-likka o'tish — **5 ta** misol (masalan: `1111₂ = ?₁₀`).
  3. **3-Bo'lim:** 10-likdan 2-likka o'tish — **5 ta** misol (masalan: `50₁₀ = ?₂`).
  4. **4-Bo'lim:** Yakuniy test — **20 ta** savol: **12 nazariy + 4 o'lchov birliklari + 4 sanoq sistemalari**.
     Savollar 51 talik bankdan har bir kategoriya ichida tasodifiy tanlanadi, ya'ni har bir
     talabaga boshqacha variant tushadi. Tarkib `js/config.js` dagi `TEST_COMPOSITION` da o'zgartiriladi.

**Jami ball: 40 ta** (10 + 5 + 5 + 20). Savollar sonini o'zgartirsangiz, ballar va barcha
"n / m" yozuvlari avtomatik moslashadi — kodni qo'lda tuzatish kerak emas.
- **Anti-Cheat (Ko'chirishning oldini olish):**
  - Talaba javob yozayotganda to'g'ri yoki xatoligi mutlaqo bildirilmaydi.
  - Bo'lim tasdiqlangach, faqat nechta to'g'ri topgani (masalan: *10 tadan 8 ta to'g'ri*) ko'rsatiladi.
  - To'g'ri javoblar va yechilish qoidalari yonidagi talabalarga ko'rinmasligi uchun aslo ko'rsatilmaydi!
  - 1 marta tasdiqlangan bo'lim qulflanadi ("Bajarildi") va qayta o'zgartirib bo'lmaydi.
  - **4-bo'lim (Test)** faqat o'qituvchi maxsus ruxsat berganida (Admin panel orqali yoki PIN-kod bilan) ochiladi.

- **Chiqish tugmasi:** talaba ishini tugatgach "Chiqish" ni bosadi va bitta kompyuterda
  keyingi talaba o'z ismi bilan kirib ishlaydi.

### 2. O'qituvchi Admin Paneli (`admin.html`):
- **Parol bilan himoyalangan:** panel `js/config.js` dagi `ADMIN_PASSWORD` (boshlang'ich: `ustoz2603`)
  kiritilmaguncha ochilmaydi. Talaba sahifasida admin panelga havola yo'q.
- **Jonli holat:** har bir talaba yonida 🟢 Tizimda / ⚪ Chiqqan va oxirgi faollik vaqti.
- **Jonli Dashboard:** Tizimga kirgan barcha talabalar, ularning ayni damda qaysi bo'limda turgani va olgan ballari real vaqtda yangilanib turadi.
- **Alohida Ustunlar:** 1-bo'lim, 2-bo'lim, 3-bo'lim, Test, Jami ball, Foiz va 5 ballik baho alohida aniq ustunlarda aks etadi.
- **Javoblarni Tekshirish:** Har bir talabaning qatoridagi "Javoblar" tugmasi orqali uning har bir savolga yozgan javoblarini tekshirish mumkin.
- **Testni Masofadan Boshqarish:** Admin paneldagi tugma orqali testni barcha talabalarga birdaniga ochish yoki PIN-kodni o'zgartirish.
- **Eksport Imkoniyatlari:**
  - **Excel (`.xlsx` va `.xls`):** Barcha ustunlari toza, sarlavhalari ko'k rangda, baholari ajratilgan tayyor Excel fayli. Ikkinchi **"Javoblar"** varag'ida har bir talabaning har bir savolga yozgan javobi va to'g'ri javoblar qatori.
  - **CSV Eksport:** Universal formatda yuklab olish.
  - **Chop etish (Vedomost):** Rasmiy baholar vedomosti ko'rinishida qog'ozga yoki PDF ga chiqarish (imzo va sana joylari bilan).

---

## Sahifalar
- **`index.html`** — Talaba kompyuterida ochiladigan asosiy platforma havolasi.
- **`admin.html`** — O'qituvchi kompyuteridagi monitoring va Excel eksport paneli.
- **`dars.html`** — Doska yoki proyektorga chiqarib dars o'tish uchun nazariy va amaliy qo'llanma.
- **`google_sheets_script.gs`** — Google Sheets jadvaliga ma'lumotlarni yozuvchi va uzatuvchi skript.

---

## ⚠️ Ishga tushirishdan oldin

Admin panel boshqa kompyuterlardagi talabalarni ko'rishi va testni masofadan ochish
ishlashi uchun **`google_sheets_script.gs` ni Apps Script'ga qayta joylab, yangi versiya
sifatida deploy qilish shart**. To'liq ko'rsatma: [QOLLANMA_NETLIFY_VA_SHEETS.md](QOLLANMA_NETLIFY_VA_SHEETS.md).
