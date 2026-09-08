# GITHUB PAGES ORQALI BEPUL DEPLOY QILISH (2 DAQIQA)

Loyiha allaqachon Git tizimiga ulandi va commit qilindi. Endi uni GitHub'ga yuklab, GitHub Pages orqali jonli efirga chiqarish bo'yicha yo'riqnoma:

---

## 1-QADAM: GitHub'da yangi repozitoriy ochish
1. Brauzeringizda [github.com/new](https://github.com/new) sahifasini oching.
2. **Repository name:** `3-dars` deb nom bering.
3. Repozitoriyni **Public** holatda qoldiring.
4. "Add a README file" yoki boshqa katakchalarga tegmang (chunki loyihamizda allaqachon README mavjud).
5. Yashil **Create repository** tugmasini bosing.

---

## 2-QADAM: Kodlarni GitHub'ga yuborish (Push qilish)
Repozitoriy ochilgandan so'ng, chiqqan sahifada sizning repozitoriy havolangiz ko'rinadi:  
`https://github.com/SIZNING_USERNAME/3-dars.git`

Kompyuteringizdagi PowerShell yoki terminalda quyidagi 2 ta buyruqni bering:

```powershell
git remote add origin https://github.com/SIZNING_USERNAME/3-dars.git
git push -u origin main
```
*(O'zingizning GitHub username va parolingiz/tokeningizni kiritasiz).*

---

## 3-QADAM: GitHub Pages ni yoqish (1 marta bosiladi)
1. GitHub repozitoriyangizning yuqori menyusidagi **Settings (Sozlamalar)** bo'limiga kiring.
2. Chap ustundagi menyudan **Pages** bo'limini bosing.
3. **Branch** bo'limida:
   - `None` o'rniga **`main`** ni tanlang;
   - Papka sifatida `/(root)` ni qoldiring.
4. **Save (Saqlash)** tugmasini bosing.

---

## 4-QADAM: Tayyor havola!
Oradan 30-60 soniya o'tgach, sahifani yangilasangiz, yuqorida yashil rangda saytingiz havolasi chiqadi:  
👉 **`https://SIZNING_USERNAME.github.io/3-dars/`**

Ushbu havolani talabalarga tashlaysiz. Ular kirib testni bemalol yechishadi va natijalar avtomatik sizning Google Sheets jadvalingizga tushaveradi!
