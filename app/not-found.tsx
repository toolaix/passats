import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
      <h1 style={{ color: "#fff" }}>Page not found</h1>
      <p style={{ color: "var(--muted)" }}>
        <Link href="/">Back to PassATS</Link>
      </p>
    </main>
  );
}
