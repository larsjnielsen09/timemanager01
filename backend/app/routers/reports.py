from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/by-project", response_model=List[schemas.SummaryByProject])
def report_by_project(
    from_date: Optional[date] = Query(default=None, alias="from"),
    to_date: Optional[date] = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Project.id.label("project_id"),
            models.Project.name.label("project_name"),
            models.Customer.id.label("customer_id"),
            models.Customer.name.label("customer_name"),
            func.sum(models.TimeEntry.hours).label("hours"),
        )
        .join(models.TimeEntry, models.TimeEntry.project_id == models.Project.id)
        .join(models.Customer, models.Customer.id == models.Project.customer_id)
        .group_by(models.Project.id, models.Project.name, models.Customer.id, models.Customer.name)
        .order_by(func.sum(models.TimeEntry.hours).desc())
    )
    if from_date is not None:
        query = query.filter(models.TimeEntry.work_date >= from_date)
    if to_date is not None:
        query = query.filter(models.TimeEntry.work_date <= to_date)
    rows = query.all()
    return [
        schemas.SummaryByProject(
            project_id=r.project_id,
            project_name=r.project_name,
            customer_id=r.customer_id,
            customer_name=r.customer_name,
            hours=float(r.hours or 0.0),
        )
        for r in rows
    ]


@router.get("/by-customer", response_model=List[schemas.SummaryByCustomer])
def report_by_customer(
    from_date: Optional[date] = Query(default=None, alias="from"),
    to_date: Optional[date] = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Customer.id.label("customer_id"),
            models.Customer.name.label("customer_name"),
            func.sum(models.TimeEntry.hours).label("hours"),
        )
        .join(models.Project, models.Project.customer_id == models.Customer.id)
        .join(models.TimeEntry, models.TimeEntry.project_id == models.Project.id)
        .group_by(models.Customer.id, models.Customer.name)
        .order_by(func.sum(models.TimeEntry.hours).desc())
    )
    if from_date is not None:
        query = query.filter(models.TimeEntry.work_date >= from_date)
    if to_date is not None:
        query = query.filter(models.TimeEntry.work_date <= to_date)
    rows = query.all()
    return [
        schemas.SummaryByCustomer(
            customer_id=r.customer_id,
            customer_name=r.customer_name,
            hours=float(r.hours or 0.0),
        )
        for r in rows
    ]
