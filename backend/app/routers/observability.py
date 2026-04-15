"""Observability: frontend Web Vitals beacon collector.

Accepts Core Web Vitals (LCP/CLS/INP/FCP/TTFB) posted via navigator.sendBeacon
from src/lib/webVitals.ts. Logs to structured logger; aggregation/storage is
out of scope here (wire a log pipeline or metrics sink downstream).
"""

from __future__ import annotations

import logging
from typing import Literal, Optional

from fastapi import APIRouter, Request, Response, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()


class WebVitalMetric(BaseModel):
    name: Literal["CLS", "INP", "LCP", "FCP", "TTFB"]
    value: float = Field(..., description="Metric value in ms (LCP/INP/FCP/TTFB) or unitless (CLS)")
    rating: Optional[Literal["good", "needs-improvement", "poor"]] = None
    id: str
    navigationType: Optional[str] = None


@router.post(
    "/observability/web-vitals",
    include_in_schema=False,  # beacon endpoint, no OpenAPI noise
)
async def ingest_web_vitals(metric: WebVitalMetric, request: Request) -> Response:
    # sendBeacon does not follow auth headers reliably — endpoint is wired
    # auth-less at main.py include_router level by passing dependencies=[].
    logger.info(
        "web_vitals",
        extra={
            "metric": metric.name,
            "value": metric.value,
            "rating": metric.rating,
            "metric_id": metric.id,
            "navigation_type": metric.navigationType,
            "ua": request.headers.get("user-agent", ""),
        },
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
