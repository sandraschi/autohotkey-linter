import { useEffect, useState } from "react";
import { ExternalLink, FileText, Info } from "lucide-react";

interface ReviewRound {
  round: number;
  verdict: string;
  note: string;
}

interface PaperData {
  title: string;
  authors: string[];
  abstract: string;
  scores: Record<string, number>;
  verdict: string;
  github_url: string;
  arxiv_url: string | null;
  review_status: string;
  review_history?: ReviewRound[];
}

export default function PaperPage() {
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/paper")
      .then((r) => r.json())
      .then((d) => { setPaper(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!paper) {
    return <div className="text-zinc-500 text-center py-12">Failed to load paper data.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 leading-snug">{paper.title}</h1>
        <p className="text-zinc-400 mt-2">{paper.authors.join(", ")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {paper.github_url && (
          <a
            href={paper.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-200 border border-zinc-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        )}
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm border border-amber-500/20">
          <Info className="h-4 w-4" />
          {paper.review_status}
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Abstract</h2>
        <p className="text-zinc-300 leading-relaxed text-sm">{paper.abstract}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Review Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(paper.scores).map(([dim, score]) => (
            <div key={dim} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{dim}</span>
                <span className="text-sm font-bold text-zinc-100">{score}/10</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
        <Info className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <span className="text-zinc-300 text-sm leading-relaxed">{paper.verdict}</span>
      </div>

      {paper.review_history && paper.review_history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Self-Review History</h2>
          <div className="space-y-2">
            {paper.review_history.map((r) => (
              <div key={r.round} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4">
                <span className="text-sm font-bold text-zinc-500 shrink-0">R{r.round}</span>
                <div>
                  <span className="text-sm font-semibold text-zinc-200">{r.verdict}</span>
                  <p className="text-sm text-zinc-400 mt-1">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Draft Status
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          This paper has not been submitted or posted anywhere -- there is no arXiv ID and no citation yet.
          {" "}Code: {paper.github_url}
        </p>
      </div>
    </div>
  );
}
