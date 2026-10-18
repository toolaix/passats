# ATS Resume Checker — MVP 一页规格

**状态：** 探路者深验通过（黄海 / 谨慎可进）  
**栈：** Next.js（App Router）+ Cloudflare（Pages/Workers + D1）+ Creem  
**原则：** 先长尾楔入，再冲主词；不做 Jobscan 全能 CRM。

---

## 产品名备选

| 名 | 备注 |
|----|------|
| **PassATS**（荐） | 短、动作清晰、好记域名 |
| ScoreGate | 偏分数 |
| ResumeParse | 偏技术 |
| CheckATS | 直白 SEO |
| GateResume | 次选 |

对外一句：**上传简历，马上看 ATS 分数、问题清单、和职位描述缺哪些词。**

---

## 主关键词策略

| 优先级 | 词 | 量（美） | 用法 |
|--------|-----|----------|------|
| P0 长期 | `ats resume checker` | 12,100 | 首页 H1 / title，60–90 天目标 |
| P0 楔入 | `free ats resume scan` | 590 | 首屏强调 Free · 无强制注册可扫 |
| P0 楔入 | `ats resume score` | 480 | 结果页 SEO |
| P1 | `resume ats checker` | 2,900 | 同页次标题 / 独立 landing 可选 |
| P1 | `ats score checker` | 2,400 | 同上 |
| 不做主打 | `ats-friendly resume template` | 27,100 | 模板意图，非本 MVP |
| 不做主打 | `jobscan alternative` | 50 | 量太小，仅博客提及 |

详见同目录 `VERDICT.md`（竞争黄海、冲首页路径）。

---

## MVP 功能（必须有）

1. **上传** PDF / DOCX（≤5MB），可选粘贴文本  
2. **可选粘贴 Job Description**（有 JD 才做关键词匹配分）  
3. **解析** → 纯文本（pdf-parse / mammoth 类，Worker 或 Node）  
4. **输出一屏结果**  
   - 总分 0–100（规则可解释，勿吹「官方 ATS」）  
   - 分项：格式/章节、联系方式、动词与量化、关键词匹配（有 JD 时）、风险项（表格/双栏/图片字等启发式）  
   - **Issues 列表**（可执行：缺 Skills 节、电话格式、缺词 Top N）  
   - **Missing keywords**（相对 JD）  
5. **免费额度**：未登录每日 N 次（建议 2–3）；登录后提高  
6. **付费闸（Creem）**：无限扫描 / 导出 PDF 报告 / 保存历史（Saved scans）  
7. **隐私文案**：默认不落库全文；付费「保存」才加密存 D1  

**明确非目标（Non-goals）**

- 不做 Jobscan 级：Chrome 插件、求职看板、自动投递、LinkedIn 同步  
- 不做完整简历编辑器 / 上千模板（可后期）  
- 不承诺「通过 Workday/Taleo 官方验证」  
- 不做人工代写 CV（Oxford 模式可以后再议）

---

## Freemium vs 价格猜测

| 层 | 内容 | 价格猜测 |
|----|------|----------|
| Free | 每日有限次扫描 + 分数 + 前 5 条 issues；缺词列表截断 | $0 |
| Pro | 无限扫、完整关键词、导出 PDF、历史记录 | **$12–15/月** 或 **$79/年**（低于 Jobalytics $24 / WahResume $28，打「便宜 Jobscan-lite」） |
| 可选 | 单次解锁完整报告 | **$4.99** 一次（验证愿付） |

竞品锚点：Jobalytics $23.99/月；WahResume $28/月；二者均用 **免费 checker 获客**。

---

## 技术栈

- **前端/全栈：** Next.js 15 App Router + TypeScript + Tailwind  
- **托管：** Cloudflare Pages + OpenNext / Workers  
- **数据：** D1（用户、订阅、可选 saved scans）；R2 仅临时上传可选  
- **支付：** Creem（月/年 + webhook 开闸）  
- **解析：** Worker 内 PDF/DOCX → text；打分纯规则 + 可选后期 LLM 润色建议（MVP 可无 LLM 控成本）

---

## 建造顺序 W1–W3

### W1 — 能扫、能排长尾（约 3–5 天）
- 落地页（主词 title）+ 上传区 + 结果 UI（产品感，非简陋表单）  
- PDF/DOCX 解析 + 规则打分 + issues + JD 关键词  
- 免费次数（cookie / IP 粗限）  
- 页面 SEO：`/ats-resume-checker`、FAQ、「free scan」文案  
**验收：** 本地/预览上传样例 PDF 出分；Lighthouse 可用；无支付也可演示。

### W2 — 账户与配额（约 2–3 天）
- 邮箱登录（OTP）+ D1  
- 登录提高限额；Saved scans 列表  
**验收：** 两台浏览器额度隔离；保存/打开历史。

### W3 — Creem 变现 + 导出（约 2 天）
- `/pricing`、checkout、webhook → `premium_until`  
- 导出 PDF 报告闸门  
**验收：** 沙盒支付后无限扫；取消/过期收回。

（SEO 扩页、Workday 专题、模板库 → W4+，不堵 MVP。）

---

## 验收标准（整体）

- [ ] 主路径：上传 → ≤10s 出分与 issues  
- [ ] 无 JD / 有 JD 两种结果都正确降级  
- [ ] Free 有明确上限；Pro 经 Creem 开通  
- [ ] 隐私说明可见；默认不永久存简历明文  
- [ ] 目标长尾词出现在 title/H1/FAQ；主词在首页  
- [ ] 不做插件/看板/投递  

---

## 和竞争的关系（执行提醒）

- 首页竞品多为 **免费工具获客** → 我们同样必须 **无登录可先扫**  
- Jobscan 未霸主词 → 差异化写清：**更快、更便宜、只做 checker+报告**，不装全能  
- 冲主词靠 60–90 天；**前 30 天 KPI = 长尾进入 + 付费转化验证**，不是 DR
