from functools import lru_cache

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "JinzaIQ"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./japantech.db"
    jwt_secret: str = "dev-change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    cors_origins: list[AnyHttpUrl | str] = ["http://localhost:3000"]
    ai_provider: str = "mock"
    embedding_provider: str = "mock"
    scoring_weights: dict[str, float] = {
        "skills": 0.35,
        "experience": 0.20,
        "language": 0.15,
        "visa": 0.10,
        "location": 0.05,
        "salary": 0.05,
        "education": 0.05,
        "semantic": 0.05,
    }

    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")


@lru_cache
def get_settings() -> Settings:
    return Settings()
