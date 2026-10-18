import styles from "./Faq.module.css";

const ITEMS = [
  {
    q: "What is an ATS resume checker?",
    a: "Applicant Tracking Systems (ATS) parse resumes into structured fields. A checker estimates how readable your file is and whether it matches keywords from a job description — before you apply.",
  },
  {
    q: "Is this a free ATS resume scan?",
    a: "Yes. You get a limited number of free scans per day with no account required. Upgrade later for unlimited scans and full reports (coming in W3).",
  },
  {
    q: "How is the ATS resume score calculated?",
    a: "PassATS uses transparent rules: sections, contact fields, action verbs & metrics, layout risk heuristics, and optional JD keyword overlap. It is not an official vendor score.",
  },
  {
    q: "Do you store my resume?",
    a: "No. In the free scanner, text is processed for the request only and is not saved to a database. Do not upload secrets you would not paste into a web form.",
  },
  {
    q: "PDF or DOCX — which is better?",
    a: "Either works if it is text-based. Avoid scanned images, heavy tables, text boxes, and dual-column designs that confuse older parsers.",
  },
  {
    q: "Will this guarantee I pass Workday or Taleo?",
    a: "No tool can honestly guarantee that. Employers configure ATS differently. Use PassATS to catch common parse and keyword issues, then tailor each application.",
  },
];

export function Faq() {
  return (
    <div className={styles.wrap}>
      {ITEMS.map((item) => (
        <details key={item.q} className={styles.item}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
