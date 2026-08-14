import type { MatchAnalysis } from "@/lib/api";

const labels: [keyof MatchAnalysis, string][] = [
  ["skill_match_score", "Skills"],
  ["experience_match_score", "Experience"],
  ["language_match_score", "Language"],
  ["visa_score", "Visa"],
  ["location_match_score", "Location"],
  ["salary_score", "Salary"],
  ["semantic_score", "Semantic"]
];

export function ScoreBreakdown({ match }: { match: MatchAnalysis }) {
  return (
    <div className="score-grid">
      {labels.map(([key, label]) => (
        <div className="score" key={key}>
          <div className="subtle">{label}</div>
          <strong>{match[key]}%</strong>
        </div>
      ))}
    </div>
  );
}
