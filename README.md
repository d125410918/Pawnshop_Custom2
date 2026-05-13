# 高雄來新當鋪前台 Neon + Vercel Blob 完整儲存版

這版已完成：

1. 前台可上傳自拍照、身分證正面、身分證反面，但不是必填。
2. 圖片會先上傳到 Vercel Blob。
3. Vercel Blob 回傳圖片 URL。
4. 前台再把表單資料與三個圖片 URL 送到 `/api/applications`。
5. `/api/applications` 會真正執行 `INSERT INTO customers`。
6. 成功寫入 Neon PostgreSQL 後才回傳 `success: true`。

## Vercel 環境變數

前台 Vercel 和後台 Vercel 都要使用同一組 Neon：

```env
DATABASE_URL="你的 Neon PostgreSQL 連線字串"
```

前台 Vercel 另外要有 Blob token：

```env
BLOB_READ_WRITE_TOKEN="Vercel Blob 自動產生的 token"
```

## Vercel Blob 設定

到前台 Vercel 專案：

Storage → Create Database → Blob

建立後，Vercel 會自動把 Blob 讀寫 token 加到環境變數。

## Neon 資料表

到 Neon SQL Editor 執行 `customers.sql`。

## 欄位對應

前台 `name` → customers.name  
前台 `identityNumber` → customers.national_id  
前台 `city` → customers.city  
前台 `district` → customers.district  
固定 `monthly` → customers.income_type  
目前無精準收入數字 → customers.income_amount = null  
前台 `incomeLabel` → customers.income_label  
前台 `collateral` → customers.collateral  
前台 `fundingNeedWan` → customers.funding_need  
固定 `pending` → customers.status  
Blob 自拍 URL → customers.selfie_url  
Blob 身分證正面 URL → customers.id_card_front_url  
Blob 身分證反面 URL → customers.id_card_back_url  
`created_at` / `updated_at` → NOW()

## 重要

這版不使用本機 JSON、txt、localStorage 或 Vercel 專案資料夾儲存客戶資料。

沒上傳圖片時仍可送出，資料庫圖片欄位會寫入 null。
有上傳圖片時會先上傳到 Vercel Blob，再把 URL 寫入資料庫。圖片上傳或資料庫寫入失敗時，前台會顯示錯誤，不會假裝成功。
