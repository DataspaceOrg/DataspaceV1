from fastapi import APIRouter, HTTPException
import logging
from services.user_service import create_user

logger = logging.getLogger(__name__)
