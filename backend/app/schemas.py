from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# Shared
class Pagination(BaseModel):
    total: int
    skip: int
    limit: int


# Customer
class CustomerBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    contact_email: Optional[str] = None
    notes: Optional[str] = None
    active: bool = True


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    contact_email: Optional[str] = None
    notes: Optional[str] = None
    active: Optional[bool] = None


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Department
class DepartmentBase(BaseModel):
    name: str
    customer_id: int


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None


class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True


# Project
class ProjectBase(BaseModel):
    name: str
    customer_id: int
    department_id: Optional[int] = None
    active: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    customer_id: Optional[int] = None
    department_id: Optional[int] = None
    active: Optional[bool] = None


class ProjectOut(ProjectBase):
    id: int

    class Config:
        from_attributes = True


# Time Entry
class TimeEntryBase(BaseModel):
    project_id: int
    work_date: date
    hours: float = Field(gt=0)
    description: Optional[str] = None
    billable: bool = True


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    project_id: Optional[int] = None
    work_date: Optional[date] = None
    hours: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    billable: Optional[bool] = None


class TimeEntryOut(TimeEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Reports
class SummaryByProject(BaseModel):
    project_id: int
    project_name: str
    customer_id: int
    customer_name: str
    hours: float


class SummaryByCustomer(BaseModel):
    customer_id: int
    customer_name: str
    hours: float
