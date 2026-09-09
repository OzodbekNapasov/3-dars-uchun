# O'QITUVCHI UCHUN TO'LIQ QO'LLANMA: GOOGLE SHEETS & NETLIFY

Ushbu qo'llanma orqali siz platformani Google Sheets jadvalingizga ulab,
Netlify tarmog'ida bepul ishga tushirishingiz mumkin.

---

## ⚠️ 1-QADAM (ENG MUHIM): Apps Script'ni QAYTA deploy qilish

> **Diqqat!** `google_sheets_script.gs` faylini har safar o'zgartirganda skriptni
> Apps Script'ga qayta joylab, **yangi versiya** sifatida deploy qilish shart.
> Aks holda admin panel boshqa kompyuterdagi talabalarni ko'rmaydi va testni
> masofadan ochish ishlamaydi.
>
> **Natijalar qayerga yoziladi:** skript jadvalda `3-Dars Natijalar` nomli
> **alohida varaq** ochadi. Oldingi loyihaning `Natijalar` varag'idagi
> 129 ta qatorga tegilmaydi — ular joyida saqlanib qoladi.

Sizning jadvalingiz:
**[3-dars testi — Google Sheets](https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit)**

1. Yuqoridagi havolani oching.
2. Menyudan: **Kengaytmalar (Extensions)** → **Apps Script**.
3. Kod tahrirlagichidagi barcha yozuvlarni o'chiring (`Ctrl + A`, `Delete`).
4. Loyihadagi **`google_sheets_script.gs`** faylidagi barcha kodni nusxalab
   (`Ctrl + A`, `Ctrl + C`) Apps Script oynasiga qo'ying (`Ctrl + V`).
5. **Saqlash** (`Ctrl + S`).
6. **Deploy** → **Manage deployments** (agar avval deploy qilgan bo'lsangiz)
   → qalamcha (**Edit**) → **Version: New version** → **Deploy**.
   - Birinchi marta qilayotgan bo'lsangiz: **Deploy** → **New deployment** →
     tishli g'ildirakcha → **Web app**.
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← **juda muhim!**
7. Google ruxsat so'rasa: **Authorize access** → akkauntni tanlang → **Advanced** →
   **Go to ... (unsafe)** → **Allow**.
8. Berilgan **Web app URL** ni nusxalab, `js/config.js` dagi
   `GOOGLE_SHEET_WEBAPP_URL` qiymatiga qo'ying (agar havola o'zgargan bo'lsa).

### Tekshirish
Brauzerda shu manzilni oching (o'z havolangiz bilan):

```
https://script.google.com/macros/s/SIZNING_ID/exec?action=get_test_status
```

- ✅ To'g'ri: `{"status":"success","isTestUnlocked":false,"teacherPin":"2603"}`
- ❌ Noto'g'ri: `Google Sheets Webhook tayyor...` — demak eski versiya, 6-qadamni qayta bajaring.

Shuningdek, admin panelning yuqori qismidagi ko'rsatkichga qarang:
**"Jonli sinxronizatsiya"** — aloqa bor; **"Server bilan aloqa yo'q"** — skript qayta deploy qilinmagan.

---

## 2-QADAM: Netlify tarmog'iga bepul yuklash

1. [app.netlify.com/drop](https://app.netlify.com/drop) saytiga kiring.
2. Email yoki Google orqali kiring.
3. Ish stolidagi **`3-dars`** papkasini "Drag and drop" maydoniga sudrab tashlang.
4. 10-15 soniyada sayt havolasi tayyor bo'ladi (masalan `https://3-dars-testi.netlify.app`).
5. **Talabalarga faqat asosiy havolani** bering — `admin.html` ni bermang.

---

## 3-QADAM: Parol va PIN kodlar

| Nima uchun | Qiymat | Qayerda o'zgartiriladi |
|---|---|---|
| Admin panelga kirish paroli | `1207` | `js/config.js` → `ADMIN_PASSWORD` |
| Testni ochish PIN-kodi | `2603` | Admin panel → "O'zgartirish" tugmasi |

- Admin paroli brauzer yopilguncha bir marta so'raladi.
- Talaba sahifasida admin panelga **hech qanday havola yo'q** — manzilni qo'lda yozgan
  talaba ham parolsiz kira olmaydi.
- PIN-kodni o'zgartirsangiz, eski PIN darhol ishlamay qoladi.

---

## 4-QADAM: Dars davomida ishlash tartibi

1. **Siz:** `admin.html` ni oching, parolni kiriting.
2. **Talabalar:** asosiy havolani ochib, familiya, ism va guruhni kiritadi.
3. Admin jadvalida talabalar **🟢 Tizimda** holatida paydo bo'ladi, qaysi bo'limda
   ekani va ballari real vaqtda yangilanib turadi.
4. 1, 2, 3-bo'limlar tugagach: admin paneldagi **"Barchaga ruxsat"** tugmasini yoqing —
   test barcha kompyuterlarda 20 soniya ichida o'zi ochiladi.
   (Yoki talabaga PIN-kodni aytasiz.)
5. Dars oxirida: **Excel (.xlsx) yuklab olish** — ikkita varaq bilan:
   - **Natijalar** — bo'limlar, jami ball, foiz, baho.
   - **Javoblar** — har bir talabaning har bir savolga yozgan javobi + to'g'ri javoblar qatori.
6. **Chop etish (Vedomost)** — rasmiy imzo joylari bilan qog'ozga yoki PDF ga.

### Bitta kompyuterda bir necha talaba
Talaba ishini tugatgach, o'ng yuqoridagi **"Chiqish"** tugmasini bosadi va keyingi talaba
o'z ismi bilan kiradi. Chiqish admin panelda darhol **⚪ Chiqqan** bo'lib ko'rinadi.

---

## Himoya choralari

- Talaba javob yozayotganda to'g'ri yoki xato ekani **umuman bildirilmaydi**.
- Bo'lim tasdiqlangach qulflanadi, faqat "8 / 10 to'g'ri" ko'rsatiladi —
  to'g'ri javoblar va yechimlar **hech qachon ekranga chiqmaydi**.
- 2-bo'lim 1-bo'limsiz, 3-bo'lim 2-bo'limsiz ochilmaydi.
- Test faqat o'qituvchi ruxsati (PIN yoki masofaviy tugma) bilan ochiladi.
- Test taymeri absolyut vaqt bo'yicha ishlaydi — talaba tabni yopib qo'yib
  taymerni to'xtata olmaydi.
- O'ng tugma, nusxa olish, F12, Ctrl+U/S/P bloklangan.

> **Eslatma:** bu statik (serversiz) sayt bo'lgani uchun to'g'ri javoblar brauzer
> kodida saqlanadi. Tajribali talaba brauzer vositalari orqali ularni topishi
> nazariy jihatdan mumkin. Kerak bo'lsa javoblarni shifrlash keyingi bosqichda qo'shiladi.
