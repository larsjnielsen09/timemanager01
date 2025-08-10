from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("/", response_model=List[schemas.DepartmentOut])
def list_departments(
    customer_id: int | None = None,
    skip: int = 0,
    limit: int = Query(1000, le=10000),
    db: Session = Depends(get_db),
):
    query = db.query(models.Department)
    if customer_id is not None:
        query = query.filter(models.Department.customer_id == customer_id)
    return query.order_by(models.Department.name.asc()).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.DepartmentOut, status_code=201)
def create_department(payload: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=400, detail="Customer does not exist")
    department = models.Department(**payload.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.put("/{department_id}", response_model=schemas.DepartmentOut)
def update_department(department_id: int, payload: schemas.DepartmentUpdate, db: Session = Depends(get_db)):
    department = db.get(models.Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(department, key, value)
    db.commit()
    db.refresh(department)
    return department


@router.delete("/{department_id}", status_code=204)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    department = db.get(models.Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(department)
    db.commit()
    return None
