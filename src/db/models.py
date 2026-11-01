"""
RetailVision - SQLAlchemy Database Models
Models for Users, Stores, Construction Plots, and Marketplace Datasets.
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from src.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stores = relationship("Store", back_populates="owner")
    plots = relationship("ConstructionPlot", back_populates="owner")


class Store(Base):
    __tablename__ = "stores"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, default="")
    dataset_id = Column(String(100), nullable=True)
    dataset_path = Column(String(255), nullable=False)

    # 3D Marketplace Coordinates & Visual Attributes
    grid_x = Column(Float, nullable=False, default=0.0)
    grid_z = Column(Float, nullable=False, default=0.0)
    rotation_y = Column(Float, default=0.0)
    color = Column(String(30), default="#3B82F6")
    is_default = Column(Boolean, default=False)

    # District & Construction Lifecycle Metadata
    district_id = Column(String(50), default="district_1")
    district_name = Column(String(100), default="Central Commercial Plaza")
    construction_status = Column(String(30), default="completed")  # completed, in_progress

    # Cached Aggregate Stats for fast marketplace hover tooltips
    total_revenue = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    total_products = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="stores")


class ConstructionPlot(Base):
    __tablename__ = "construction_plots"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    plot_index = Column(Integer, nullable=False, index=True)
    district_id = Column(String(50), default="district_1")
    district_name = Column(String(100), default="Central Commercial Plaza")
    grid_x = Column(Float, nullable=False)
    grid_z = Column(Float, nullable=False)
    rotation_y = Column(Float, default=0.0)
    is_occupied = Column(Boolean, default=False)
    store_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="plots")
