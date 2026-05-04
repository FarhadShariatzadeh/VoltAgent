from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://voltagent:voltagent@localhost:5432/voltagent"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Notifications
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "alerts@voltagent.app"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # External APIs
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    ELECTRICITY_MAPS_API_KEY: str = ""
    ELECTRICITY_MAPS_BASE_URL: str = "https://api.electricitymap.org/v3"

    # App
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
