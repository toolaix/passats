# PassATS 本地账单 / 登录验收

## 前置

> Wrangler / D1 本地迁移需要 **Node.js ≥ 22**（`nvm use 22`）。`next build` 在 Node 20 也可过。


```bash
cd /workspace/worktrees/passats-billing   # 或仓库根
cp .dev.vars.example .dev.vars           # DEV_PREMIUM=1
npm install
npm run db:migrate:local
npm run dev
```

`next.config.ts` 会调用 `initOpenNextCloudflareForDev()`，本地 `next dev` 可绑 D1。  
**纯扫简历**不依赖 D1；登录 / 历史 / checkout / webhook 需要 D1。

## 验收路径

1. `/#scan` — 匿名免费扫，issues/缺词截断  
2. `/login` — 邮箱 → 终端或响应里的 6 位码 → `/account`  
3. `DEV_PREMIUM=1` 时 `/api/me` 应 `premium: true`；扫完可 **Save to history** → `/history`  
4. `/pricing` — 未登录点 Go Pro → 跳登录；已登录且 Creem 未配会报配置错误（预期）  
5. Webhook 本地测（关掉 DEV_PREMIUM 才测真订阅开闸）：

```bash
# 先登录拿到 /api/me 的 user.id
SECRET=whsec_test_local
BODY='{"id":"evt_local_1","eventType":"checkout.completed","created_at":1,"object":{"id":"ch_x","object":"checkout","request_id":"usr_REPLACE_ME","status":"completed","metadata":{"user_id":"usr_REPLACE_ME"},"customer":{"id":"cust_x","email":"you@example.com"},"product":{"id":"prod_month","billing_period":"every-month"},"subscription":{"id":"sub_x","status":"active","current_period_end_date":"2099-01-01T00:00:00.000Z"}}}'
SIG=$(node -e "const c=require('crypto');const b=process.argv[1];const s=process.argv[2];process.stdout.write(c.createHmac('sha256',s).update(b).digest('hex'))" "$BODY" "$SECRET")
curl -sS -X POST http://localhost:3000/api/webhooks/creem \
  -H "Content-Type: application/json" \
  -H "creem-signature: $SIG" \
  -d "$BODY"
```

## 生产缺口（Boyd）

- Creem 建 $12/月、$79/年商品 → `CREEM_PRICE_*` + `CREEM_API_KEY` + webhook → `/api/webhooks/creem`  
- Pages 绑定真实 D1 `database_id`（替换 wrangler.toml 占位）  
- 生产 **关掉** `DEV_PREMIUM`  
- PDF 报告导出仍为 soon  
- OpenNext 上 `pdf-parse` 依赖 `nodejs_compat`（已写 wrangler）；若 Worker 解析失败，可把 scan 留在 Node Pages Functions 或单独 Worker  
