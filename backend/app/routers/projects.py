from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    customer_id: Optional[int] = None,
    department_id: Optional[int] = None,
    active: Optional[bool] = None,
    skip: int = 0,
    limit: int = Query(1000, le=10000),
    db: Session = Depends(get_db),
):
    query = db.query(models.Project)
    if customer_id is not None:
        query = query.filter(models.Project.customer_id == customer_id)
    if department_id is not None:
        query = query.filter(models.Project.department_id == department_id)
    if active is not None:
        query = query.filter(models.Project.active == active)
    return query.order_by(models.Project.name.asc()).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.ProjectOut, status_code=201)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    if not db.get(models.Customer, payload.customer_id):
        raise HTTPException(status_code=400, detail="Customer does not exist")
    if payload.department_id is not None and not db.get(models.Department, payload.department_id):
        raise HTTPException(status_code=400, detail="Department does not exist")
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(project_id: int, payload: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    data = payload.model_dump(exclude_unset=True)
    if "customer_id" in data and not db.get(models.Customer, data["customer_id"]):
        raise HTTPException(status_code=400, detail="Customer does not exist")
    if "department_id" in data and data["department_id"] is not None and not db.get(models.Department, data["department_id"]):
        raise HTTPException(status_code=400, detail="Department does not exist")
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
