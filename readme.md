# Vefforritun 2 2025, verkefni 2

## Hýsing
Gagnagrunnurinn og síðan er hýst á [Render](https://vef2-2025-v2-yfzb.onrender.com/)

## Keyrsla og uppsetning

Til þess að keyra og setja upp verkefnið þarf að hafa:
- `node` útgáfu 22
- `postgresql` uppsett og keyrandi
- `env` skrá með viðeigandi gildum

Verkefnið er svo keyrt með
```{bash}
createdb vef2-2024-v2 # eða það nafn á gagnagrunninum í .env skránni
npm install
npm run setup # setur upp gagnagrunn og setur inn gögn
npm run test # keyrir lint og test
npm run dev # keyrir dev útgáfu af verkefni
npm start # keyrir production útgáfu af verkefni
```

