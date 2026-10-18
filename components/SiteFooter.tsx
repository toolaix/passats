import Link from "next/link";
import { site } from "@/site.config";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>{site.name}</div>
            <p className={styles.note}>
              Free ATS resume checker — score, issues, and job-keyword gaps in
              under a minute.
            </p>
          </div>
          <div className={styles.links}>
            <Link href="/#scan">Scan</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <p className={styles.disclaimer}>
          Scores are rule-based estimates for parseability and keyword coverage.
          PassATS is <strong>not</strong> affiliated with Workday, Taleo,
          Greenhouse, Lever, or any employer ATS. Results are not an official
          pass/fail verdict.
        </p>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {site.name}. Resume text is processed for
          your request only and is not stored server-side in the free scanner.
        </p>
      </div>
    </footer>
  );
}
