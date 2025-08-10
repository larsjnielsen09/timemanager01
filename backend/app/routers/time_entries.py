from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/time-entries", tags=["time_entries"])


@router.get("/", response_model=List[schemas.TimeEntryOut])
def list_time_entries(
    project_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    from_date: Optional[date] = Query(default=None, alias="from"),
    to_date: Optional[date] = Query(default=None, alias="to"),
    skip: int = 0,
    limit: int = Query(1000, le=10000),
    db: Session = Depends(get_db),
):
    query = db.query(models.TimeEntry)
    if project_id is not None:
        query = query.filter(models.TimeEntry.project_id == project_id)
    if customer_id is not None:
        query = query.join(models.TimeEntry.project).filter(models.Project.customer_id == customer_id)
    if from_date is not None:
        query = query.filter(models.TimeEntry.work_date >= from_date)
    if to_date is not None:
        query = query.filter(models.TimeEntry.work_date <= to_date)
    return (
        query.order_by(models.TimeEntry.work_date.desc(), models.TimeEntry.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=schemas.TimeEntryOut, status_code=201)
def create_time_entry(payload: schemas.TimeEntryCreate, db: Session = Depends(get_db)):
    project = db.get(models.Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=400, detail="Project does not exist")
    entry = models.TimeEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=schemas.TimeEntryOut)
def update_time_entry(entry_id: int, payload: schemas.TimeEntryUpdate, db: Session = Depends(get_db)):
    entry = db.get(models.TimeEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    data = payload.model_dump(exclude_unset=True)
    if "project_id" in data:
        if not db.get(models.Project, data["project_id"]):
            raise HTTPException(status_code=400, detail="Project does not exist")
    for key, value in data.items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_time_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(models.TimeEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    db.delete(entry)
    db.commit()
    return None
