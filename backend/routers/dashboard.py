"""Dashboard endpoints — mock analytics data for the MVP."""

from typing import Any

from fastapi import APIRouter, Depends

from models import User
from routers.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Return mock email-marketing KPIs for the authenticated user."""
    return {
        "total_subscribers": 14502,
        "emails_sent_this_month": 45200,
        "average_open_rate": 24.5,
        "average_click_rate": 3.2,
        "recent_campaigns": [
            {
                "name": "Spring Product Launch",
                "subject": "Something new just landed 🌱",
                "status": "sent",
                "sent_count": 12480,
                "open_rate": 27.4,
                "sent_at": "Feb 12, 2026",
            },
            {
                "name": "Weekly Newsletter #42",
                "subject": "5 growth loops worth stealing",
                "status": "sent",
                "sent_count": 14102,
                "open_rate": 22.1,
                "sent_at": "Feb 9, 2026",
            },
            {
                "name": "Re-engagement Drip",
                "subject": "We miss you — here's 20% off",
                "status": "scheduled",
                "sent_count": 0,
                "open_rate": 0.0,
                "sent_at": "Feb 18, 2026",
            },
        ],
        "engagement_chart": [
            {"day": "Mon", "opens": 4820, "clicks": 610},
            {"day": "Tue", "opens": 5240, "clicks": 705},
            {"day": "Wed", "opens": 4980, "clicks": 651},
            {"day": "Thu", "opens": 6120, "clicks": 823},
            {"day": "Fri", "opens": 5890, "clicks": 764},
            {"day": "Sat", "opens": 3940, "clicks": 452},
            {"day": "Sun", "opens": 4310, "clicks": 517},
        ],
    }
