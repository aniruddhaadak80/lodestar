import type { Metadata } from "next";
import { PEOPLE } from "@/lib/people";
import type { Person } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/data";

export const metadata: Metadata = {
  title: "People",
  description: "Who's who in AI safety — roles, known-for, and first-party links.",
};

const COMMUNICATORS = new Set([
  "jack-clark",
  "nathan-lambert",
  "simon-willison",
  "melanie-mitchell",
  "rob-miles",
  "gary-marcus",
]);

const GOV = new Set(["gov", "society"]);
const EVALS = new Set(["evals", "risk"]);
const TECH = new Set(["alignment", "control", "interp", "training"]);

function pick(pred: (p: Person) => boolean) {
  return PEOPLE.filter((p) => !COMMUNICATORS.has(p.id)).filter(pred);
}

const GROUPS = [
  {
    id: "technical",
    title: "Technical researchers & builders",
    blurb: "Interpretability, control, alignment theory, training methods.",
    people: pick((p) => p.topics.some((t) => TECH.has(t))),
  },
  {
    id: "evals",
    title: "Evals, forecasting & measurement",
    blurb: "Benchmarks, time horizons, red teaming, catastrophic-risk analysis.",
    people: pick((p) => p.topics.some((t) => EVALS.has(t))),
  },
  {
    id: "gov",
    title: "Governance, rights & critique",
    blurb: "Policy, accountability, labor, power — the people who disagree with the field productively.",
    people: pick((p) => p.topics.some((t) => GOV.has(t))),
  },
  {
    id: "comms",
    title: "Writers, newsletters & explainers",
    blurb: "The people whose writing keeps the rest of the field honest and legible.",
    people: PEOPLE.filter((p) => COMMUNICATORS.has(p.id)),
  },
];

export default function PeoplePage() {
  return (
    <div className="px-5 py-8 sm:px-10">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow mb-2">People · {PEOPLE.length} entries · first-party links only</p>
        <h1 className="display text-[2.6rem] text-ink sm:text-[3.4rem]">Who&apos;s who</h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-muted">
          The field has named researchers now, and most of them publish somewhere free, most weeks.
          Grouped by room, with only first-party links — personal sites, lab pages, official channels.
          No third-party bios, no invented titles.
        </p>
      </header>

      <div className="space-y-12">
        {GROUPS.map((g) => (
          <section key={g.id}>
            <div className="mb-5 border-b border-line pb-3">
              <p className="eyebrow mb-2">{g.people.length} people</p>
              <h2 className="display text-[1.9rem] text-ink">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.blurb}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.people.map((p) => (
                <div key={p.id} id={p.id} className="card card-hover scroll-mt-6 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="serif text-[1.3rem] text-ink">{p.name}</h3>
                      <p className="mt-0.5 font-mono text-[0.64rem] text-faint">{p.org}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {p.site && (
                        <a href={p.site} target="_blank" rel="noopener noreferrer" className="chip" title="Website">
                          site
                        </a>
                      )}
                      {p.blog && (
                        <a href={p.blog} target="_blank" rel="noopener noreferrer" className="chip" title="Blog or newsletter">
                          blog
                        </a>
                      )}
                      {p.video && (
                        <a href={p.video} target="_blank" rel="noopener noreferrer" className="chip" title="YouTube channel">
                          ▶
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-[0.86rem] leading-relaxed text-muted">{p.role}</p>
                  <p className="mt-3 border-l-2 border-line pl-3 text-[0.84rem] leading-relaxed text-ink/85">
                    {p.known}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.topics.map((t) => {
                      const topic = TOPIC_BY_ID[t];
                      if (!topic) return null;
                      return (
                        <a
                          key={t}
                          href={`/atlas#${t}`}
                          className="rounded-full border px-2 py-0.5 font-mono text-[0.6rem] transition-opacity hover:opacity-70"
                          style={{
                            borderColor: `color-mix(in oklab, ${topic.color} 35%, var(--c-border))`,
                            color: `color-mix(in oklab, ${topic.color} 78%, var(--c-text))`,
                          }}
                        >
                          {topic.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
