# Job Match Analysis Prompt v1

Return strict JSON matching the `MatchAnalysis` schema. Use deterministic component scores from the
backend as facts. You may summarize risks and recommendations, but do not invent salary, visa, or
company facts. Visa language must remain cautious: "likely", "possible", "not mentioned", or
"verify directly with employer".
