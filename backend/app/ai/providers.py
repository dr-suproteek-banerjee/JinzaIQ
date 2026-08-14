from app.schemas import MatchAnalysis


class AIProvider:
    def explain(self, analysis: MatchAnalysis) -> MatchAnalysis:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    def explain(self, analysis: MatchAnalysis) -> MatchAnalysis:
        if analysis.missing_skills:
            gap = ", ".join(analysis.missing_skills[:3])
            analysis.summary = f"Strong deterministic fit with clear gaps around {gap}."
        else:
            analysis.summary = "Excellent fit across the deterministic matching dimensions."
        analysis.confidence = "high" if analysis.match_score >= 80 else "medium"
        return MatchAnalysis.model_validate(analysis.model_dump())


def get_ai_provider() -> AIProvider:
    return MockAIProvider()
