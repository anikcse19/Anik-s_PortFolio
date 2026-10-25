import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume";

/**
 * The résumé PDF. Single column, built-in Helvetica and real text (no images
 * of text), so applicant-tracking systems can parse every line.
 */

const INK = "#141416";
const INK_2 = "#45454C";
const INK_3 = "#6B6B74";
const RULE = "#DADAD6";
const ACCENT = "#1F4FD1";

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 44, paddingHorizontal: 46, fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.45, color: INK_2 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.1, color: INK, letterSpacing: -0.3 },
  headline: { marginTop: 6, fontSize: 11.5, lineHeight: 1.3, color: INK },
  contact: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", fontSize: 8.5, color: INK_3 },
  contactItem: { marginRight: 10 },
  link: { color: INK_3, textDecoration: "none" },
  summary: { marginTop: 12, color: INK_2 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: ACCENT,
    paddingBottom: 4,
    marginBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: RULE,
  },
  entry: { marginBottom: 10 },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: "Helvetica-Bold", color: INK, fontSize: 10, flexShrink: 1, paddingRight: 8 },
  entryOrg: { fontFamily: "Helvetica", color: INK },
  period: { fontSize: 8.5, color: INK_3, flexShrink: 0 },
  meta: { fontSize: 8.5, color: INK_3, marginTop: 1 },
  bullet: { flexDirection: "row", marginTop: 2.5 },
  bulletDot: { width: 9, color: INK_3 },
  bulletText: { flex: 1 },
  stack: { marginTop: 3, fontSize: 8.5, color: INK_3 },
  metrics: { marginTop: 3, flexDirection: "row", flexWrap: "wrap" },
  metric: { marginRight: 12, fontSize: 9 },
  metricValue: { fontFamily: "Helvetica-Bold", color: INK },
  skillRow: { flexDirection: "row", marginBottom: 3 },
  skillName: { width: 150, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 8 },
  skillItems: { flex: 1 },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      {/* Keep the heading with at least the start of its first entry. */}
      <Text style={s.sectionTitle} minPresenceAhead={40}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  return (
    <Document title={`${data.name} — Résumé`} author={data.name} subject={data.headline} keywords={data.skills.flatMap((c) => c.items).join(", ")} creator={data.name} producer={data.name}>
      <Page size={data.paperSize} style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        <Text style={s.headline}>{data.headline}</Text>
        <View style={s.contact}>
          {data.contact.map((c) => (
            <Text key={c.label} style={s.contactItem}>
              {c.href ? (
                <Link src={c.href} style={s.link}>
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </Text>
          ))}
        </View>
        {data.summary ? <Text style={s.summary}>{data.summary}</Text> : null}

        {data.experience.length ? (
          <Section title="Experience">
            {data.experience.map((e, i) => (
              <View key={`${e.organization}-${i}`} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>
                    {e.title}
                    <Text style={s.entryOrg}> — {e.organization}</Text>
                  </Text>
                  {e.period ? <Text style={s.period}>{e.period}</Text> : null}
                </View>
                {e.meta ? <Text style={s.meta}>{e.meta}</Text> : null}
                <Bullets items={e.bullets} />
                {e.stack.length ? <Text style={s.stack}>Stack: {e.stack.join(", ")}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {data.projects.length ? (
          <Section title="Selected projects">
            {data.projects.map((p) => (
              <View key={p.title} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{p.title}</Text>
                  {p.url ? (
                    <Link src={p.url} style={[s.link, s.period]}>
                      {p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </Link>
                  ) : null}
                </View>
                <Text style={{ marginTop: 1 }}>{p.summary}</Text>
                {p.metrics.length ? (
                  <View style={s.metrics}>
                    {p.metrics.map((m) => (
                      <Text key={m.label} style={s.metric}>
                        <Text style={s.metricValue}>{m.value}</Text> {m.label}
                      </Text>
                    ))}
                  </View>
                ) : null}
                <Bullets items={p.bullets} />
                {p.stack.length ? <Text style={s.stack}>Stack: {p.stack.join(", ")}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {data.skills.length ? (
          <Section title="Skills">
            {data.skills.map((c) => (
              <View key={c.name} style={s.skillRow} wrap={false}>
                <Text style={s.skillName}>{c.name}</Text>
                <Text style={s.skillItems}>{c.items.join(", ")}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {data.education.length ? (
          <Section title="Education">
            {data.education.map((ed, i) => (
              <View key={`${ed.institution}-${i}`} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>
                    {ed.degree || ed.institution}
                    {ed.degree ? <Text style={s.entryOrg}> — {ed.institution}</Text> : null}
                  </Text>
                  {ed.period ? <Text style={s.period}>{ed.period}</Text> : null}
                </View>
                {ed.details ? <Text style={s.meta}>{ed.details}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {data.additional.length ? (
          <Section title="Additional">
            <Bullets items={data.additional} />
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}
