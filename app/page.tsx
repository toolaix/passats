import { ScanTool } from "@/components/ScanTool";
import { Faq } from "@/components/Faq";
import { HomeHero } from "@/components/HomeHero";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { site } from "@/site.config";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main>
      <HomeHero />

      <section className={styles.section} id="scan">
        <Reveal className={styles.sectionHead}>
          <h2>Check your resume against ATS basics</h2>
          <p>
            Upload a file or paste text. Optionally add a job description for
            keyword gaps. Built for searches like “free ats resume scan” and
            “ats resume score” — not a Jobscan clone.
          </p>
        </Reveal>
        <ScanTool />
      </section>

      <section className={styles.section} id="how">
        <Reveal className={styles.sectionHead}>
          <h2>How it works</h2>
          <p>Transparent rules. No black-box “official ATS” claims.</p>
        </Reveal>
        <Reveal className={styles.steps} stagger>
          <RevealItem as="article" className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <h3>Parse your file</h3>
            <p>
              We extract plain text from PDF or DOCX in memory for this request
              only — nothing is saved on the free scanner.
            </p>
          </RevealItem>
          <RevealItem as="article" className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <h3>Score what ATS cares about</h3>
            <p>
              Sections, contact fields, action verbs & metrics, layout risks,
              and optional JD keyword overlap.
            </p>
          </RevealItem>
          <RevealItem as="article" className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <h3>Fix the list</h3>
            <p>
              Every issue includes a concrete how-to-fix. Re-scan after you
              edit — within your daily free quota.
            </p>
          </RevealItem>
        </Reveal>
      </section>

      <section className={styles.section} id="pricing">
        <Reveal className={styles.sectionHead}>
          <h2>Simple pricing</h2>
          <p>Start free. Pro unlocks unlimited scans, full keywords, and history.</p>
        </Reveal>
        <Reveal className={styles.pricingGrid} stagger>
          <RevealItem className={styles.priceCard}>
            <h3>Free</h3>
            <p className={styles.price}>
              $0 <span>/ forever</span>
            </p>
            <ul>
              <li>{site.monetization.freeQuotaLabel}</li>
              <li>Score + top issues</li>
              <li>Keyword gaps (truncated)</li>
              <li>No account required</li>
            </ul>
          </RevealItem>
          <RevealItem
            className={`${styles.priceCard} ${styles.priceCardFeatured}`}
          >
            <h3>Pro</h3>
            <p className={styles.price}>
              ${site.monetization.premiumPriceMonthly}{" "}
              <span>/ mo · or ${site.monetization.premiumPriceYearly}/yr</span>
            </p>
            <ul>
              <li>Unlimited scans</li>
              <li>Full issue & keyword lists</li>
              <li>PDF report export (soon)</li>
              <li>Saved scan history</li>
            </ul>
            <p className={styles.mutedNote}>
              <a href="/pricing">Go to pricing</a> to subscribe via Creem, or{" "}
              <a href="/login">sign in</a> first.
            </p>
          </RevealItem>
        </Reveal>
      </section>

      <section
        className={styles.section}
        id="faq"
        style={{ paddingBottom: "3rem" }}
      >
        <Reveal className={styles.sectionHead}>
          <h2>FAQ</h2>
          <p>
            Common questions about this{" "}
            <strong style={{ color: "#e2e8f0", fontWeight: 650 }}>
              ATS resume checker
            </strong>
            .
          </p>
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
      </section>
    </main>
  );
}
