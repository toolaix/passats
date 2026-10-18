# PassATS W1 交付说明

**日期：** 2026-10-18  
**路径：** `/workspace/passats`

## 怎么跑

```bash
cd /workspace/passats
npm install
npm run test          # 样例简历带 JD → score 87
npm run dev           # http://localhost:3000
# 或
npm run build && npm run start
```

## 样例分数（fixture）

| 输入 | Score |
|------|-------|
| `lib/ats/fixtures/sample-resume.txt` + JD | **87** |
| 仅简历、无 JD | **85**（封顶 88，留 JD 提升空间） |
| 空文本 | **13** |

## 已交付

- 深色 / 青绿产品落地页（主词 + free scan 文案）
- `/` 内嵌扫描工具；`/check` → `/#scan`
- PDF/DOCX/粘贴 → 规则打分 + issues + JD 缺词
- Cookie 日限 3 次；免费 issues/缺词截断
- FAQ、免责声明、`/privacy`（W1 不落库简历全文）
- `site.config.ts`：PassATS、$12/mo 占位、规格关键词
- `npm run build` 通过（纯 Next，未接 OpenNext/CF）

## W2 阻塞 / 后续

1. **Cloudflare OpenNext + D1** — W1 未接；部署前对齐 embroidery-pricer 的 wrangler/OpenNext（注意 `pdf-parse` 需 Node runtime，edge 可能要换 `unpdf`）
2. **邮箱 OTP 登录** — 提高日限额、Saved scans
3. **Creem** — `/pricing` checkout + webhook → `premium_until`
4. **PDF 报告导出** — Pro 闸
5. `pdf-parse` npm audit 有已知告警；上线前评估换库

## 关键文件

- `lib/ats/score.ts` / `keywords.ts` / `parse.ts` / `rate-limit.ts`
- `app/api/scan/route.ts`
- `components/ScanTool.tsx`
- `site.config.ts`
- `docs/zh/mvp-spec.md` · `VERDICT.md`
