# 3-Dars: Axborot Texnologiyalari — Amaliyot va Test Platformasi hamda Admin Panel

Tibbiyot texnikumi 1-kurs talabalari uchun **Axborotning o'lchov birliklari** va **Sanoq sistemalari** (2-lik va 10-lik) mavzulari bo'yicha interaktiv o'quv, hisoblash amaliyoti va test platformasi.

---

## Asosiy Imkoniyatlar

### 1. Talaba Platformasi (`index.html`):
- **Guruhlar tanlovi:** `26-01`, `26-02`, `26-03`, `26-04`, `26-05`, `26-06`, `26-07` guruhlari ro'yxatdan o'tishda tanlanadi.
- **4 ta Bosqichli struktura:**
  1. **1-Bo'lim:** Axborot o'lchov birliklarini hisoblash (10 ta amaliy misol, masalan: `5 KB = ? B`).
  2. **2-Bo'lim:** 2-likdan 10-likka o'tish (10 ta amaliy misol, masalan: `101₂ = ?₁₀`).
  3. **3-Bo'lim:** 10-likdan 2-likka o'tish (10 ta amaliy misol, masalan: `50₁₀ = ?₂`).
  4. **4-Bo'lim:** Yakuniy Test Sinovi (20 ta savol, 4 variantli).
- **Anti-Cheat (Ko'chirishning oldini olish):**
  - Talaba javob yozayotganda to'g'ri yoki xatoligi mutlaqo bildirilmaydi.
  - Bo'lim tasdiqlangach, faqat nechta to'g'ri topgani (masalan: *10 tadan 8 ta to'g'ri*) ko'rsatiladi.
  - To'g'ri javoblar va yechilish qoidalari yonidagi talabalarga ko'rinmasligi uchun aslo ko'rsatilmaydi!
  - 1 marta tasdiqlangan bo'lim qulflanadi ("Bajarildi") va qayta o'zgartirib bo'lmaydi.
  - **4-bo'lim (Test)** faqat o'qituvchi maxsus ruxsat berganida (Admin panel orqali yoki PIN-kod bilan) ochiladi.

### 2. O'qituvchi Admin Paneli (`admin.html`):
- **Jonli Dashboard:** Tizimga kirgan barcha talabalar, ularning ayni damda qaysi bo'limda turgani va olgan ballari real vaqtda yangilanib turadi.
- **Alohida Ustunlar:** 1-bo'lim, 2-bo'lim, 3-bo'lim, Test, Jami ball, Foiz va 5 ballik baho alohida aniq ustunlarda aks etadi.
- **Javoblarni Tekshirish:** Har bir talabaning qatoridagi "Javoblar" tugmasi orqali uning har bir savolga yozgan javoblarini tekshirish mumkin.
- **Testni Masofadan Boshqarish:** Admin paneldagi tugma orqali testni barcha talabalarga birdaniga ochish yoki PIN-kodni o'zgartirish.
- **Eksport Imkoniyatlari:**
  - **Excel (`.xlsx` va `.xls`):** Barcha ustunlari toza, sarlavhalari ko'k rangda, baholari ajratilgan tayyor Excel fayli.
  - **CSV Eksport:** Universal formatda yuklab olish.
  - **Chop etish (Vedomost):** Rasmiy baholar vedomosti ko'rinishida qog'ozga yoki PDF ga chiqarish (imzo va sana joylari bilan).

---

## Sahifalar
- **`index.html`** — Talaba kompyuterida ochiladigan asosiy platforma havolasi.
- **`admin.html`** — O'qituvchi kompyuteridagi monitoring va Excel eksport paneli.
- **`dars.html`** — Doska yoki proyektorga chiqarib dars o'tish uchun nazariy va amaliy qo'llanma.
- **`google_sheets_script.gs`** — Google Sheets jadvaliga ma'lumotlarni yozuvchi va uzatuvchi yangilangan skript.
