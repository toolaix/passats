# ATS Resume Checker — Monid 深验结论

**日期：** 2026-10-18（Asia/Shanghai）  
**Monid 花费：** ≈ **$0.15**（余额 $0.69 → **$0.54**）  
**总判：** **黄海 / 谨慎可进** — 量够大、付费成立，但首页不是空城；**不要一上来硬刚主词，先长尾楔入。**

---

## 1) 竞争强度（绿 / 黄 / 红）

| 维度 | 证据 | 判分 |
|------|------|------|
| 主词量 | `ats resume checker` **12,100**/月（美 2840），CPC **$4.08**，KD **53**，竞争 MEDIUM | 量大 → 有人抢 |
| Top5 域权 | 主词 SERP 前排：**WahResume DR13**、Reddit、**Jobalytics DR36**、Reddit、**OxfordCV DR0.1** | **弱 DR 工具站能上首页** |
| 品牌垄断 | **Jobscan DR79 在主词 / `ats score checker` 采样 SERP 前 9–12 均未出现** | 非 Jobscan 独占红海 |
| 内容 vs 工具 | 首页大量是 **真上传工具** + Reddit 帖，少见纯文案博客占 #1 | 必须做工具，不能只写文章 |
| 付费证明 | WahResume Pro **$28/月**；Jobalytics **$23.99/月**；Oxford 用免费扫描导 **人工写 CV** | 愿付费成立 |
| 流量现实 | 薄站也能吃量：Oxford DR≈0 仍 ~**4.4k** Ahrefs 流量；WahResume DR13 ~**4.1k**；Jobalytics DR36 ~**3.4k** | 新站有先例 |

**综合：黄海（Yellow），不是绿海真空，也不是 Jobscan 封死的红海。**

一句话：搜索量看着「很大」，但首页是 **一堆免费工具 + Reddit**，域权参差；门槛在 **产品体验 + 一点外链/信任**，不在「必须 DR70」。

---

## 2) 新 Cloudflare 域名 30–90 天冲首页？

### 主词 `ats resume checker`（12.1k，KD53）
| 窗口 |  realist 预期 |
|------|----------------|
| **30 天** | 进前 10 **概率低**（新域零信任；AI Overview + Reddit 占位）。最多：索引 + 长尾冒头。 |
| **60–90 天** | **有机会进第 1 页后半 / 第 2 页前半**，前提：真工具可分享、页面极快、FAQ/对照文、少量外链（求职社区、Product Hunt、对比页）。 |
| 需要什么 | ① 上传 PDF/DOCX → 分数+问题+JD 关键词（对标 WahResume/Jobalytics）② 无登录可扫 1–3 次 ③ 标题/H1 精准吃主词 ④ 2–5 条真实外链或 Reddit 自然提及 ⑤ Core Web Vitals 干净 |

**不要幻想：** 纯静态落地、无真解析、无差异化 → 90 天也上不去。

### 更现实：先楔长尾（30 天可争）
| 词 | 量/月 | KD | 为何先打 |
|----|------|-----|----------|
| `free ats resume scan` | 590 | 26 | 「免费」意图强，竞品标题已在用 |
| `ats resume score` | 480 | 20 | 工具结果页可占 |
| `best ats resume checker free` | 390 | 20 | 对比文 + 自家工具 |
| `workday ats resume checker` | 70 | 11 | 系统向利基，竞品弱 |
| `resume ats checker` | 2,900 | 30 | 次主词，BeamJobs 等较强但仍是工具 SERP |

**建议路径：** W1 上线工具吃 `free ats resume scan` / `ats resume score` → 有数据与外链后再顶 `ats resume checker`。

---

## 3) 还进不进？进法？

| 选项 | 建议 |
|------|------|
| 直接只打主词当唯一赌注 | **否** — 量诱人，KD53 + 多工具站，新域 30 天难回本预期 |
| 完全放弃赛道 | **否** — Jobscan 没吃干主词；DR0–36 已证明能排；竞品在收 **$24–28/月** |
| **长尾楔入 + 同一工具页扩词** | **是（推荐）** — 一个上传打分产品，多 URL/段落吃 free / score / Workday；主词当 60–90 天目标 |

**判词：谨慎可进（黄海）。**  
适合 Boyd「月入至少几百刀」目标的前提是：首页级流量来自 **工具集群（主词+长尾）**，不是单靠 12k 主词幻想 CTR；保守模型仍是 **先进长尾验证转化，再砸主词 SEO**。

---

## 关键数字速查

- 主词：`ats resume checker` **12,100** · CPC **$4.08** · KD **53**
- 次主：`resume ats checker` **2,900** · `ats score checker` **2,400**
- 模板大红词 `ats-friendly resume template` **27,100** — **意图是模板不是 checker，MVP 不做**
- `jobscan alternative` 仅 **50** — 不当主词
- Jobscan DR **79** 但采样主词 SERP **未进前排**
- 数据目录：`/workspace/ats-resume-checker/monid/`（SUMMARY.json）
