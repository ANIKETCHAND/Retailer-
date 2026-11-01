"""
Unit and integration tests for Database models and migrations (test_database.py).
Tests all 9 normalized schema models, relationships, field synchronization, and schema migrations.
"""

from datetime import datetime
import uuid
import pytest
from src.db.database import Base, SessionLocal, engine, is_postgres, run_migrations
from src.db.models import (
    AuditLog, ConstructionPlot, Dataset, District, Profile,
    SalesRecord, Store, User
)
from src.db.seed import seed_database


@pytest.fixture(scope="module")
def db():
    seed_database()
    session = SessionLocal()
    yield session
    session.close()


def test_database_models_exist(db):
    """Verify all 9 models can be queried and return records."""
    assert db.query(User).count() >= 1
    assert db.query(Profile).count() >= 1
    assert db.query(Store).count() >= 5
    assert db.query(Dataset).count() >= 5
    assert db.query(SalesRecord).count() >= 100
    assert db.query(ConstructionPlot).count() >= 6
    assert db.query(District).count() >= 1
    assert db.query(AuditLog).count() >= 1


def test_store_model_field_synonyms(db):
    """Verify compatibility between store_name/name, building_position_x/grid_x, etc."""
    store = db.query(Store).filter(Store.id == "store_electronics").first()
    assert store is not None
    # Both store_name and name must return identical string
    assert store.name == "Nova Electronics"
    assert store.store_name == "Nova Electronics"
    # Both building_position_x and grid_x must match
    assert store.grid_x == store.building_position_x
    assert store.grid_z == store.building_position_z
    # Both status and construction_status must match
    assert store.status == store.construction_status


def test_construction_plot_field_synonyms(db):
    """Verify compatibility between position_x/grid_x, is_occupied/status, store_id/associated_store_id."""
    plot = db.query(ConstructionPlot).filter(ConstructionPlot.plot_index == 0).first()
    assert plot is not None
    assert plot.grid_x == plot.position_x
    assert plot.grid_z == plot.position_z
    assert plot.is_occupied is True
    assert plot.status == "occupied"
    assert plot.store_id == plot.associated_store_id


def test_relationships(db):
    """Verify foreign key relationships across User, Profile, Store, and Dataset."""
    admin = db.query(User).filter(User.email == "admin@retailvision.com").first()
    assert admin is not None
    assert admin.profile is not None
    assert admin.profile.email == admin.email
    assert len(admin.stores) >= 5

    store = db.query(Store).filter(Store.id == "store_electronics").first()
    assert store.owner is not None
    assert store.owner.id == admin.id
    assert store.dataset is not None
    assert store.dataset.store_id == store.id
    assert len(store.dataset.sales_records) > 0


def test_audit_log_creation(db):
    """Verify audit log records can be inserted and queried."""
    log_id = str(uuid.uuid4())
    log = AuditLog(
        id=log_id,
        user_id="1",
        action="test_action",
        entity_type="test_entity",
        entity_id="entity_123",
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()

    queried = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    assert queried is not None
    assert queried.action == "test_action"

    db.delete(queried)
    db.commit()


def test_run_migrations_idempotent():
    """Verify running migrations repeatedly does not error."""
    run_migrations()
    assert engine is not None
