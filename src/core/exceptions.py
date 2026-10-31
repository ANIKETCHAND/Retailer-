"""
RetailVision - Domain Exceptions
Custom exception hierarchy for clean error handling across API, UI, and business services.
"""

class RetailVisionError(Exception):
    """Base exception for all RetailVision domain errors."""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class DataValidationError(RetailVisionError):
    """Raised when uploaded CSV fails schema, type, or constraint validation."""
    pass


class DatasetEmptyError(RetailVisionError):
    """Raised when dataset contains zero records."""
    pass


class ForecastingError(RetailVisionError):
    """Raised when machine learning forecasting fails or data is insufficient."""
    pass


class ReportGenerationError(RetailVisionError):
    """Raised when PDF or CSV export generation fails."""
    pass


class ResourceNotFoundError(RetailVisionError):
    """Raised when a requested resource (dataset, product, file) is not found."""
    pass
