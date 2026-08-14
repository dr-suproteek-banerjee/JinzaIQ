from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.embeddings.providers import get_embedding_provider
from app.models import Company, Job, JobEmbedding

SKILLS = [
    "Python", "TypeScript", "React", "Next.js", "FastAPI", "PostgreSQL", "AWS", "Docker",
    "Kubernetes", "Java", "Spring Boot", "Go", "Node.js", "Terraform", "Redis", "Kafka",
    "Machine Learning", "LLM", "Cybersecurity", "GraphQL", "Vue", "Ruby", "Rails", "C++",
]
CITIES = ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Fukuoka", "Yokohama", "Sapporo", "Remote"]
INDUSTRIES = ["fintech", "AI", "SaaS", "cybersecurity", "cloud", "gaming", "e-commerce", "enterprise software"]
ROLES = ["Software Engineer", "Backend Engineer", "Frontend Engineer", "Cloud Engineer", "AI Engineer", "Platform Engineer"]
JP = ["None", "N3", "N2", "N1", "Native"]
EXP = ["Entry-level", "Junior", "Mid-level", "Senior"]
VISA = ["Likely sponsors", "Does not mention sponsorship", "Unknown", "Not eligible"]


def seed_database(db: Session) -> None:
    if db.query(Job).count() >= 100:
        return
    embedder = get_embedding_provider()
    companies = []
    for i in range(30):
        company = Company(
            name=f"Sakura {INDUSTRIES[i % len(INDUSTRIES)].title()} Labs {i + 1}",
            industry=INDUSTRIES[i % len(INDUSTRIES)],
            location=CITIES[i % (len(CITIES) - 1)],
            company_size=["25-50", "51-200", "201-500", "500+"][i % 4],
            work_style=["Hybrid", "Remote-friendly", "On-site"][i % 3],
            tech_stack=", ".join(SKILLS[i % len(SKILLS): i % len(SKILLS) + 5] or SKILLS[:5]),
            visa_information=["Possible", "Likely", "Not mentioned", "Unclear"][i % 4],
        )
        db.add(company)
        companies.append(company)
    db.flush()
    for i in range(120):
        base = i % len(SKILLS)
        required = [SKILLS[(base + j) % len(SKILLS)] for j in range(5)]
        preferred = [SKILLS[(base + 5 + j) % len(SKILLS)] for j in range(3)]
        city = CITIES[i % len(CITIES)]
        job = Job(
            company_id=companies[i % len(companies)].id,
            title=f"{ROLES[i % len(ROLES)]} ({INDUSTRIES[i % len(INDUSTRIES)].title()})",
            location=city,
            prefecture=city if city != "Remote" else "Tokyo",
            remote_policy=["Remote", "Hybrid", "On-site"][i % 3],
            salary_min=4_500_000 + (i % 7) * 500_000,
            salary_max=7_000_000 + (i % 8) * 700_000,
            employment_type=["Full-time", "Contract"][i % 2],
            japanese_requirement=JP[i % len(JP)],
            english_requirement=["Professional English", "Business English", "Native English not required"][i % 3],
            visa_sponsorship=VISA[i % len(VISA)],
            experience_level=EXP[i % len(EXP)],
            required_skills=", ".join(required),
            preferred_skills=", ".join(preferred),
            responsibilities=", ".join([
                "Design production services",
                "Collaborate with Japan-based product teams",
                "Improve reliability and observability",
            ]),
            benefits=", ".join(["Flexible work", "Learning budget", "Relocation discussion", "Commuter allowance"]),
            posting_date=date.today() - timedelta(days=i % 120),
            application_url=f"https://example.com/jobs/{i + 1}",
        )
        db.add(job)
        db.flush()
        text = " ".join([job.title, job.required_skills, job.preferred_skills, job.responsibilities])
        db.add(JobEmbedding(job_id=job.id, vector=",".join(map(str, embedder.embed(text)))))
    db.commit()
