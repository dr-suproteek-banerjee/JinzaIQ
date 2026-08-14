from datetime import date

LEVEL_ORDER = {"None": 0, "N5": 1, "N4": 2, "Basic": 2, "N3": 3, "N2": 4, "N1": 5, "Native": 6}
EXPERIENCE_ORDER = {"Intern": 0, "Entry-level": 1, "Junior": 2, "Mid-level": 3, "Senior": 4}


def split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def join_csv(values: list[str]) -> str:
    return ", ".join(dict.fromkeys(v.strip() for v in values if v.strip()))


def normalize_skill(skill: str) -> str:
    aliases = {"js": "JavaScript", "ts": "TypeScript", "postgres": "PostgreSQL", "k8s": "Kubernetes"}
    cleaned = skill.strip()
    return aliases.get(cleaned.lower(), cleaned)


def freshness(posting_date: date) -> str:
    age = (date.today() - posting_date).days
    if age <= 7:
        return "Fresh"
    if age <= 30:
        return "Recent"
    if age <= 90:
        return "Aging"
    return "Verify availability"
