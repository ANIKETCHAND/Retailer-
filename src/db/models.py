"""
RetailVision - SQLAlchemy Database Models
Normalized PostgreSQL Schema for Supabase with Complete Backward Compatibility.
Tables:
  1. Profiles (user metadata)
  2. Users (authentication credentials)
  3. Stores (3D retail stores)
  4. Datasets (uploaded CSV metadata & storage tracking)
  5. Sales_Records (parsed transactional order lines)
  6. Construction_Plots (marketplace coordinates & occupancy)
  7. Districts (geographical urban commercial sectors)
  8. Reports (PDF and CSV intelligence deliverables)
  9. Audit_Logs (security and operational audit trail)
"""

from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer,
    String, Text
)
from sqlalchemy.orm import relationship, synonym
from src.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    stores = relationship("Store", back_populates="owner")
    plots = relationship("ConstructionPlot", back_populates="owner")
    datasets = relationship("Dataset", back_populates="owner")
    reports = relationship("Report", back_populates="owner")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    full_name = Column(String(150), default="")
    email = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Store(Base):
    __tablename__ = "stores"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    # Core Store Metadata
    store_name = Column(String(100), nullable=False)
    name = Column(String(100), nullable=True)  # Compatibility mirror
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, default="")
    dataset_id = Column(String(100), nullable=True, index=True)
    dataset_path = Column(String(255), nullable=True)

    # 3D Marketplace Coordinates & Visual Attributes
    district_id = Column(String(50), default="district_1", index=True)
    district_name = Column(String(100), default="Central Commercial Plaza")
    building_position_x = Column(Float, nullable=False, default=0.0)
    building_position_z = Column(Float, nullable=False, default=0.0)
    grid_x = Column(Float, nullable=False, default=0.0)  # Compatibility mirror
    grid_z = Column(Float, nullable=False, default=0.0)  # Compatibility mirror
    rotation_y = Column(Float, default=0.0)
    color = Column(String(30), default="#3B82F6")
    is_default = Column(Boolean, default=False)

    # Status & Construction Lifecycle
    status = Column(String(30), default="completed")  # 'completed', 'active', 'in_progress'
    construction_status = Column(String(30), default="completed")  # Compatibility mirror

    # Cached Aggregate Stats for fast marketplace hover tooltips
    total_revenue = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    total_products = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        # Sync name <-> store_name
        if "name" in kwargs and "store_name" not in kwargs:
            kwargs["store_name"] = kwargs["name"]
        elif "store_name" in kwargs and "name" not in kwargs:
            kwargs["name"] = kwargs["store_name"]

        # Sync grid_x <-> building_position_x
        if "grid_x" in kwargs and "building_position_x" not in kwargs:
            kwargs["building_position_x"] = kwargs["grid_x"]
        elif "building_position_x" in kwargs and "grid_x" not in kwargs:
            kwargs["grid_x"] = kwargs["building_position_x"]

        # Sync grid_z <-> building_position_z
        if "grid_z" in kwargs and "building_position_z" not in kwargs:
            kwargs["building_position_z"] = kwargs["grid_z"]
        elif "building_position_z" in kwargs and "grid_z" not in kwargs:
            kwargs["grid_z"] = kwargs["building_position_z"]

        # Sync construction_status <-> status
        if "construction_status" in kwargs and "status" not in kwargs:
            kwargs["status"] = kwargs["construction_status"]
        elif "status" in kwargs and "construction_status" not in kwargs:
            kwargs["construction_status"] = kwargs["status"]

        super().__init__(**kwargs)

    owner = relationship("User", back_populates="stores")
    dataset = relationship("Dataset", back_populates="store", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="store", cascade="all, delete-orphan")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(100), primary_key=True, index=True, default=lambda: f"ds_{uuid.uuid4().hex[:8]}")
    store_id = Column(String(100), ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    upload_status = Column(String(50), default="completed")  # 'uploaded', 'completed', 'failed'
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="datasets")
    store = relationship("Store", back_populates="dataset")
    sales_records = relationship("SalesRecord", back_populates="dataset", cascade="all, delete-orphan")


class SalesRecord(Base):
    __tablename__ = "sales_records"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(100), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(String(100), index=True)
    order_date = Column(DateTime, nullable=False, index=True)
    customer_id = Column(String(100), index=True)
    product = Column(String(255), nullable=False, index=True)
    category = Column(String(100), index=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    region = Column(String(100), index=True)
    city = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="sales_records")


class ConstructionPlot(Base):
    __tablename__ = "construction_plots"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    plot_index = Column(Integer, nullable=False, index=True)
    district_id = Column(String(50), default="district_1", index=True)
    district_name = Column(String(100), default="Central Commercial Plaza")

    # Coordinates
    position_x = Column(Float, nullable=False, default=0.0)
    position_z = Column(Float, nullable=False, default=0.0)
    grid_x = Column(Float, nullable=False, default=0.0)  # Compatibility mirror
    grid_z = Column(Float, nullable=False, default=0.0)  # Compatibility mirror
    rotation_y = Column(Float, default=0.0)

    # Status & Association
    status = Column(String(30), default="available")  # 'available', 'occupied'
    is_occupied = Column(Boolean, default=False)      # Compatibility mirror
    associated_store_id = Column(String(100), ForeignKey("stores.id", ondelete="SET NULL"), nullable=True)
    store_id = Column(String(100), nullable=True)    # Compatibility mirror

    created_at = Column(DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        # Sync grid_x <-> position_x
        if "grid_x" in kwargs and "position_x" not in kwargs:
            kwargs["position_x"] = kwargs["grid_x"]
        elif "position_x" in kwargs and "grid_x" not in kwargs:
            kwargs["grid_x"] = kwargs["position_x"]

        # Sync grid_z <-> position_z
        if "grid_z" in kwargs and "position_z" not in kwargs:
            kwargs["position_z"] = kwargs["grid_z"]
        elif "position_z" in kwargs and "grid_z" not in kwargs:
            kwargs["grid_z"] = kwargs["position_z"]

        # Sync store_id <-> associated_store_id
        if "store_id" in kwargs and "associated_store_id" not in kwargs:
            kwargs["associated_store_id"] = kwargs["store_id"]
        elif "associated_store_id" in kwargs and "store_id" not in kwargs:
            kwargs["store_id"] = kwargs["associated_store_id"]

        # Sync is_occupied <-> status
        if "is_occupied" in kwargs and "status" not in kwargs:
            kwargs["status"] = "occupied" if kwargs["is_occupied"] else "available"
        elif "status" in kwargs and "is_occupied" not in kwargs:
            kwargs["is_occupied"] = (kwargs["status"] == "occupied")

        super().__init__(**kwargs)

    owner = relationship("User", back_populates="plots")


class District(Base):
    __tablename__ = "districts"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    district_name = Column(String(100), nullable=False)
    grid_x = Column(Float, default=0.0)
    grid_z = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String(100), ForeignKey("stores.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    report_type = Column(String(50), default="pdf")  # 'pdf', 'csv'
    storage_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
    store = relationship("Store", back_populates="reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=True, index=True)
    action = Column(String(100), nullable=False)      # e.g. 'store_create', 'csv_upload', 'login'
    entity_type = Column(String(100), nullable=False) # e.g. 'store', 'dataset', 'user'
    entity_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
