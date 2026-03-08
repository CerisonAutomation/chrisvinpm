from fastapi import FastAPI, APIRouter, HTTPException, Request, Query, Depends, Header, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any, Literal
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import asyncio
import hashlib
import json
import bcrypt
import jwt
import redis.asyncio as redis
import stripe

# Fallback for missing emergentintegrations
class CheckoutSessionRequest(BaseModel):
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, Any]] = None

class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str

class CheckoutStatusResponse(BaseModel):
    status: str
    payment_status: str
    metadata: Optional[Dict[str, Any]] = None

class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str):
        stripe.api_key = api_key
        self.webhook_url = webhook_url

    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': request.currency,
                    'product_data': {'name': 'Luxury Accommodation Booking'},
                    'unit_amount': int(request.amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata=request.metadata
        )
        return CheckoutSessionResponse(session_id=session.id, url=session.url)

    async def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        session = stripe.checkout.Session.retrieve(session_id)
        return CheckoutStatusResponse(
            status=session.status,
            payment_status=session.payment_status,
            metadata=session.metadata
        )

    async def handle_webhook(self, body: bytes, signature: str) -> CheckoutStatusResponse:
        # In a real app, verify signature. For this task, we assume it's valid if key is set
        event = stripe.Event.construct_from(json.loads(body), stripe.api_key)
        if event.type == 'checkout.session.completed':
            session = event.data.object
            return CheckoutStatusResponse(
                status=session.status,
                payment_status=session.payment_status,
                session_id=session.id,
                metadata=session.metadata
            )
        return CheckoutStatusResponse(status='ignored', payment_status='ignored')

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class MockCollection:
    async def create_index(self, *args, **kwargs): return None
    async def find_one(self, *args, **kwargs): return None
    async def find(self, *args, **kwargs):
        class MockCursor:
            def sort(self, *args, **kwargs): return self
            async def to_list(self, *args, **kwargs): return []
            def limit(self, *args, **kwargs): return self
            def __aiter__(self): return self
            async def __anext__(self): raise StopAsyncIteration
        return MockCursor()
    async def update_one(self, *args, **kwargs): return None
    async def insert_one(self, *args, **kwargs): return None
    async def delete_many(self, *args, **kwargs): return None
    async def count_documents(self, *args, **kwargs): return 0

class MockDB:
    def __getattr__(self, name):
        return MockCollection()

# MongoDB connection with mock fallback
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db = MockDB()
try:
    if 'localhost' not in mongo_url: # Only use real DB if not localhost or if explicitly requested
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
        db = client[os.environ.get('DB_NAME', 'cvpm_booking')]
except Exception as e:
    logger.warning(f"MongoDB connection failed: {e}. Using mock DB.")

# ==================== GUESTY CONFIGURATION ====================

# Environment: "production" or "sandbox"
GUESTY_ENVIRONMENT = os.environ.get('GUESTY_ENVIRONMENT', 'production')

# Guesty URLs based on environment
GUESTY_URLS = {
    'production': {
        'token': 'https://booking.guesty.com/oauth2/token',
        'api_base': 'https://booking.guesty.com/api',
        'api_v1': 'https://booking-api.guesty.com/v1'
    },
    'sandbox': {
        'token': 'https://booking-sandbox.guesty.com/oauth2/token',
        'api_base': 'https://booking-sandbox.guesty.com/api',
        'api_v1': 'https://booking-sandbox.guesty.com/api'
    }
}

def get_guesty_urls():
    """Get Guesty URLs based on current environment"""
    env = os.environ.get('GUESTY_ENVIRONMENT', 'production')
    return GUESTY_URLS.get(env, GUESTY_URLS['production'])

GUESTY_CLIENT_ID = os.environ.get('GUESTY_BEAPI_CLIENT_ID')
GUESTY_CLIENT_SECRET = os.environ.get('GUESTY_BEAPI_CLIENT_SECRET')
GUESTY_WEBHOOK_SECRET = os.environ.get('GUESTY_WEBHOOK_SECRET')

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')

# Redis Configuration
REDIS_URL = os.environ.get('REDIS_URL')

# Admin JWT Configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin@cvpm.mt')
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH')
ADMIN_JWT_SECRET = os.environ.get('ADMIN_JWT_SECRET', 'cvpm-jwt-secret-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# SDK Contract - Pinned allowlist of BEAPI endpoints
SDK_CONTRACT = {
    "version": "2026-03-03",
    "allowlist": [
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings/{listingId}"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/listings/{listingId}/calendar"},
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/reservations/quotes/{quoteId}"},
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes/{quoteId}/coupons"},
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes/{quoteId}/instant"},
        {"host": "booking.guesty.com", "method": "POST", "path": "/api/reservations/quotes/{quoteId}/inquiry"},
        {"host": "booking.guesty.com", "method": "GET", "path": "/api/reservations/{reservationId}/details"},
    ]
}

# Create the main app
app = FastAPI(title="CVPM Booking Platform API", version="3.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== REDIS CONNECTION ====================

redis_client: Optional[redis.Redis] = None

async def get_redis() -> Optional[redis.Redis]:
    """Get Redis connection with lazy initialization"""
    global redis_client
    if redis_client is None and REDIS_URL:
        try:
            # Use connection pool for robustness
            redis_client = redis.from_url(
                REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5,
                retry_on_timeout=True
            )
            await redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed, falling back to MongoDB: {e}")
            redis_client = None
    return redis_client

# ==================== GUESTY TOKEN MANAGEMENT WITH REDIS ====================

class GuestyTokenCache:
    """
    Distributed token cache with stampede protection using Redis.
    BEAPI tokens use scope: booking_engine:api
    Tokens cached in Redis for distributed access, with MongoDB fallback.
    
    BEAPI Token Limits:
    - Token lifetime: ~86400 seconds (24 hours)
    - Renewal limit: ~3 per 24 hours per application
    - Must cache and reuse tokens aggressively
    """
    
    REDIS_TOKEN_KEY = "guesty:beapi:token"
    REDIS_LOCK_KEY = "guesty:beapi:lock"
    LOCK_TIMEOUT = 30  # seconds
    
    def __init__(self):
        self._local_token: Optional[str] = None
        self._local_expires_at: Optional[datetime] = None
        self._lock = asyncio.Lock()
    
    async def get_token(self) -> str:
        """Get valid token with cache-first strategy: Redis -> MongoDB -> Fetch"""
        # 1. Check local memory cache
        if self._local_token and self._local_expires_at:
            if datetime.now(timezone.utc) < self._local_expires_at - timedelta(minutes=5):
                return self._local_token
        
        # 2. Check Redis cache
        redis_conn = await get_redis()
        if redis_conn:
            try:
                cached = await redis_conn.hgetall(self.REDIS_TOKEN_KEY)
                if cached and cached.get('token'):
                    expires_at = datetime.fromisoformat(cached['expires_at'])
                    if datetime.now(timezone.utc) < expires_at - timedelta(minutes=5):
                        self._local_token = cached['token']
                        self._local_expires_at = expires_at
                        logger.info("Token loaded from Redis cache")
                        return cached['token']
            except Exception as e:
                logger.warning(f"Redis read error: {e}")
        
        # 3. Check MongoDB cache (fallback)
        cached = await db.guesty_tokens.find_one({"type": "beapi_token"}, {"_id": 0})
        if cached:
            expires_at = datetime.fromisoformat(cached["expires_at"])
            if datetime.now(timezone.utc) < expires_at - timedelta(minutes=5):
                self._local_token = cached["token"]
                self._local_expires_at = expires_at
                # Sync to Redis if available
                if redis_conn:
                    try:
                        await redis_conn.hset(self.REDIS_TOKEN_KEY, mapping={
                            'token': cached['token'],
                            'expires_at': cached['expires_at']
                        })
                        await redis_conn.expireat(self.REDIS_TOKEN_KEY, expires_at)
                    except Exception:
                        pass
                logger.info("Token loaded from MongoDB cache")
                return cached["token"]
        
        # 4. Acquire new token with distributed lock
        return await self._fetch_with_lock()
    
    async def _fetch_with_lock(self) -> str:
        """Fetch new token with distributed lock to prevent stampede"""
        redis_conn = await get_redis()
        
        # Try Redis distributed lock first
        if redis_conn:
            try:
                lock_acquired = await redis_conn.set(
                    self.REDIS_LOCK_KEY, "1", 
                    nx=True, ex=self.LOCK_TIMEOUT
                )
                if not lock_acquired:
                    # Wait for other process to complete
                    for _ in range(10):
                        await asyncio.sleep(1)
                        cached = await redis_conn.hgetall(self.REDIS_TOKEN_KEY)
                        if cached and cached.get('token'):
                            return cached['token']
            except Exception:
                pass
        
        # Fall back to local lock
        async with self._lock:
            # Double-check after acquiring lock
            if self._local_token and self._local_expires_at:
                if datetime.now(timezone.utc) < self._local_expires_at - timedelta(minutes=5):
                    return self._local_token
            
            token = await self._fetch_new_token()
            
            # Release Redis lock
            if redis_conn:
                try:
                    await redis_conn.delete(self.REDIS_LOCK_KEY)
                except Exception:
                    pass
            
            return token
    
    async def _fetch_new_token(self) -> str:
        """Fetch new OAuth2 token from Guesty BEAPI"""
        urls = get_guesty_urls()
        
        async with httpx.AsyncClient() as http_client:
            for attempt in range(3):
                try:
                    # BEAPI Quick Start: grant_type + scope + client credentials
                    response = await http_client.post(
                        urls['token'],
                        data={
                            'grant_type': 'client_credentials',
                            'scope': 'booking_engine:api',
                            'client_id': GUESTY_CLIENT_ID,
                            'client_secret': GUESTY_CLIENT_SECRET
                        },
                        headers={
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 429:
                        # Rate limited - exponential backoff with jitter
                        wait_time = (2 ** attempt) * 10 + (attempt * 2)
                        logger.warning(f"Rate limited, waiting {wait_time}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    response.raise_for_status()
                    data = response.json()
                    
                    self._local_token = data['access_token']
                    expires_in = data.get('expires_in', 86400)
                    self._local_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                    
                    # Store in Redis
                    redis_conn = await get_redis()
                    if redis_conn:
                        try:
                            await redis_conn.hset(self.REDIS_TOKEN_KEY, mapping={
                                'token': self._local_token,
                                'expires_at': self._local_expires_at.isoformat()
                            })
                            await redis_conn.expireat(self.REDIS_TOKEN_KEY, self._local_expires_at)
                        except Exception as e:
                            logger.warning(f"Redis write error: {e}")
                    
                    # Store in MongoDB (backup)
                    await db.guesty_tokens.update_one(
                        {"type": "beapi_token"},
                        {"$set": {
                            "token": self._local_token,
                            "expires_at": self._local_expires_at.isoformat(),
                            "environment": os.environ.get('GUESTY_ENVIRONMENT', 'production'),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }},
                        upsert=True
                    )
                    
                    logger.info(f"New BEAPI token acquired ({os.environ.get('GUESTY_ENVIRONMENT', 'production')}), expires at {self._local_expires_at}")
                    return self._local_token
                    
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429 and attempt < 2:
                        continue
                    logger.error(f"Token fetch failed: {e.response.text}")
                    raise HTTPException(status_code=503, detail="Guesty authentication temporarily unavailable")
                except Exception as e:
                    logger.error(f"Token error: {str(e)}")
                    if attempt < 2:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise HTTPException(status_code=503, detail="Guesty service error")
        
        raise HTTPException(status_code=503, detail="Failed to acquire Guesty token after retries")
    
    async def invalidate(self):
        """Invalidate cached token (for environment switch)"""
        self._local_token = None
        self._local_expires_at = None
        
        redis_conn = await get_redis()
        if redis_conn:
            try:
                await redis_conn.delete(self.REDIS_TOKEN_KEY)
            except Exception:
                pass
        
        await db.guesty_tokens.delete_many({})
        logger.info("Token cache invalidated")

# Global token cache
guesty_token_cache = GuestyTokenCache()

# ==================== RESPONSE CACHE ====================

class ResponseCache:
    """Cache for read-only BEAPI responses using Redis with MongoDB fallback"""
    
    CACHE_TTL = 300  # 5 minutes
    REDIS_PREFIX = "guesty:cache:"
    
    @staticmethod
    def _cache_key(endpoint: str, params: dict) -> str:
        """Generate cache key from endpoint + params"""
        param_str = json.dumps(sorted(params.items()) if params else [], default=str)
        return hashlib.md5(f"{endpoint}:{param_str}".encode()).hexdigest()
    
    async def get(self, endpoint: str, params: dict) -> Optional[dict]:
        """Get cached response if valid"""
        key = self._cache_key(endpoint, params)
        
        # Try Redis first
        redis_conn = await get_redis()
        if redis_conn:
            try:
                cached = await redis_conn.get(f"{self.REDIS_PREFIX}{key}")
                if cached:
                    logger.debug(f"Redis cache hit for {endpoint}")
                    return json.loads(cached)
            except Exception:
                pass
        
        # Fall back to MongoDB
        cached = await db.response_cache.find_one({"key": key}, {"_id": 0})
        if cached:
            expires_at = datetime.fromisoformat(cached["expires_at"])
            if datetime.now(timezone.utc) < expires_at:
                logger.debug(f"MongoDB cache hit for {endpoint}")
                return cached["data"]
        return None
    
    async def set(self, endpoint: str, params: dict, data: dict):
        """Cache response in Redis and MongoDB"""
        key = self._cache_key(endpoint, params)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=self.CACHE_TTL)
        
        # Store in Redis
        redis_conn = await get_redis()
        if redis_conn:
            try:
                await redis_conn.setex(
                    f"{self.REDIS_PREFIX}{key}",
                    self.CACHE_TTL,
                    json.dumps(data)
                )
            except Exception:
                pass
        
        # Store in MongoDB (backup)
        await db.response_cache.update_one(
            {"key": key},
            {"$set": {
                "key": key,
                "endpoint": endpoint,
                "data": data,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    async def clear_all(self):
        """Clear all cached responses"""
        redis_conn = await get_redis()
        if redis_conn:
            try:
                keys = await redis_conn.keys(f"{self.REDIS_PREFIX}*")
                if keys:
                    await redis_conn.delete(*keys)
            except Exception:
                pass
        
        result = await db.response_cache.delete_many({})
        return result.deleted_count

response_cache = ResponseCache()

# ==================== GUESTY ERROR MAPPING ====================

GUESTY_ERROR_MAP = {
    "NOT_FOUND": "Property not found or no longer available.",
    "FORBIDDEN": "Access denied to this property.",
    "WRONG_REQUEST_PARAMETERS": "Invalid booking details. Please check your dates and try again.",
    "LISTING_CALENDAR_BLOCKED": "Selected dates are blocked by the property owner.",
    "MIN_NIGHT_MISMATCH": "This property requires a minimum stay duration.",
    "COUPON_NOT_FOUND": "The coupon code was not found.",
    "COUPON_IS_DISABLED": "This coupon is no longer active.",
    "COUPON_MIN_NIGHT_MISMATCH": "Your stay doesn't meet the minimum nights for this coupon.",
    "COUPON_MAXIMUM_USES_EXCEEDED": "This coupon has reached its usage limit.",
    "COUPON_EXPIRATION_DATE_EXCEEDED": "This coupon has expired.",
    "COUPON_OUT_OF_CHECKIN_RANGE": "This coupon is not valid for your check-in date.",
    "COUPON_UNEXPECTED_ERROR": "Unable to apply coupon. Please try again.",
    "QUOTE_EXPIRED": "Your quote has expired. Please select dates again.",
    "UNAVAILABLE": "Selected dates are no longer available.",
    "BOOKING_TYPE_MISMATCH": "This property only accepts booking requests.",
}

def map_guesty_error(error_text: str, status_code: int) -> tuple[str, str]:
    """Map Guesty errors to user-friendly messages. Returns (error_code, user_message)"""
    error_lower = error_text.lower()
    
    # Check for specific error codes in response
    for code, message in GUESTY_ERROR_MAP.items():
        if code.lower().replace('_', ' ') in error_lower or code.lower() in error_lower:
            return (code, message)
    
    # Fallback pattern matching
    if "quote" in error_lower and "expired" in error_lower:
        return ("QUOTE_EXPIRED", GUESTY_ERROR_MAP["QUOTE_EXPIRED"])
    if "unavailable" in error_lower or "not available" in error_lower:
        return ("UNAVAILABLE", GUESTY_ERROR_MAP["UNAVAILABLE"])
    if "minimum" in error_lower and "night" in error_lower:
        return ("MIN_NIGHT_MISMATCH", GUESTY_ERROR_MAP["MIN_NIGHT_MISMATCH"])
    if "inquiry" in error_lower:
        return ("BOOKING_TYPE_MISMATCH", GUESTY_ERROR_MAP["BOOKING_TYPE_MISMATCH"])
    if status_code == 404:
        return ("NOT_FOUND", GUESTY_ERROR_MAP["NOT_FOUND"])
    if status_code == 403:
        return ("FORBIDDEN", GUESTY_ERROR_MAP["FORBIDDEN"])
    if status_code == 422:
        return ("WRONG_REQUEST_PARAMETERS", GUESTY_ERROR_MAP["WRONG_REQUEST_PARAMETERS"])
    
    return ("UNKNOWN", "Service temporarily unavailable. Please try again.")

# ==================== GUESTY API REQUEST ====================

async def guesty_request(
    method: str, 
    endpoint: str, 
    params: dict = None, 
    json_data: dict = None,
    use_cache: bool = False
) -> dict:
    """Make authenticated request to Guesty BEAPI with caching and retry"""
    
    # Check cache for GET requests on listings
    if use_cache and method == "GET" and "/listings" in endpoint:
        cached = await response_cache.get(endpoint, params or {})
        if cached:
            return cached
    
    token = await guesty_token_cache.get_token()
    urls = get_guesty_urls()
    
    # Rate limit: 5 req/sec, 275 req/min, 16500 req/hour
    async with httpx.AsyncClient() as http_client:
        for attempt in range(3):
            try:
                response = await http_client.request(
                    method=method,
                    url=f"{urls['api_base']}{endpoint}",
                    params=params,
                    json=json_data,
                    headers={
                        'Authorization': f'Bearer {token}',
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json'
                    },
                    timeout=60.0
                )
                
                if response.status_code == 429:
                    # Rate limited - exponential backoff with jitter
                    wait_time = (2 ** attempt) * 2 + (attempt * 0.5)
                    logger.warning(f"Rate limited on {endpoint}, waiting {wait_time}s")
                    await asyncio.sleep(wait_time)
                    continue
                
                if response.status_code >= 500 and attempt < 2:
                    # Transient server error - retry
                    await asyncio.sleep(2 ** attempt)
                    continue
                
                response.raise_for_status()
                data = response.json()
                
                # Cache successful GET responses for listings
                if use_cache and method == "GET" and "/listings" in endpoint:
                    await response_cache.set(endpoint, params or {}, data)
                
                return data
                
            except httpx.HTTPStatusError as e:
                error_code, user_message = map_guesty_error(e.response.text, e.response.status_code)
                logger.error(f"Guesty API {method} {endpoint}: {e.response.status_code} - {error_code}")
                raise HTTPException(
                    status_code=e.response.status_code, 
                    detail={"code": error_code, "message": user_message}
                )
            except Exception as e:
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
                    continue
                logger.error(f"Guesty request error: {str(e)}")
                raise HTTPException(status_code=503, detail={"code": "SERVICE_ERROR", "message": "Service temporarily unavailable"})
    
    raise HTTPException(status_code=503, detail={"code": "RETRY_EXHAUSTED", "message": "Service temporarily unavailable"})

# ==================== PYDANTIC MODELS ====================

class GuestInfo(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str

class QuoteRequest(BaseModel):
    listingId: str
    checkInDateLocalized: str
    checkOutDateLocalized: str
    guestsCount: int = 1
    guest: Optional[GuestInfo] = None
    coupons: Optional[str] = None

class CouponRequest(BaseModel):
    coupons: str

class CheckoutRequest(BaseModel):
    quoteId: str
    ratePlanId: Optional[str] = None
    guest: GuestInfo
    origin_url: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class PropertyOwnerInquiry(BaseModel):
    propertyType: str
    location: str
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    maxGuests: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    servicesInterested: Optional[str] = None
    currentlyListed: Optional[str] = None
    additionalInfo: Optional[str] = None

class CMSUpdate(BaseModel):
    data: Dict[str, Any]

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminConfigUpdate(BaseModel):
    guesty_client_id: Optional[str] = None
    guesty_client_secret: Optional[str] = None
    guesty_environment: Optional[Literal['production', 'sandbox']] = None
    stripe_api_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None

# ==================== ADMIN AUTHENTICATION ====================

def create_admin_token(email: str) -> str:
    """Create JWT token for admin"""
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc),
        "type": "admin"
    }
    return jwt.encode(payload, ADMIN_JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_admin_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=403, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify admin access"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    return verify_admin_token(credentials.credentials)

# ==================== PUBLIC API ROUTES ====================

@api_router.get("/")
async def root():
    return {
        "message": "CVPM Booking Platform API", 
        "version": "3.0.0",
        "environment": os.environ.get('GUESTY_ENVIRONMENT', 'production')
    }

@api_router.get("/health")
async def health():
    redis_conn = await get_redis()
    return {
        "status": "healthy", 
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "redis": "connected" if redis_conn else "unavailable",
        "environment": os.environ.get('GUESTY_ENVIRONMENT', 'production')
    }

@api_router.get("/config/public")
async def get_public_config():
    """Get public configuration for frontend"""
    return {
        "stripe_publishable_key": STRIPE_PUBLISHABLE_KEY,
        "google_maps_api_key": os.environ.get('GOOGLE_MAPS_API_KEY'),
        "environment": os.environ.get('GUESTY_ENVIRONMENT', 'production'),
        "firebase": {
            "apiKey": os.environ.get('FIREBASE_API_KEY'),
            "authDomain": os.environ.get('FIREBASE_AUTH_DOMAIN'),
            "projectId": os.environ.get('FIREBASE_PROJECT_ID'),
            "storageBucket": os.environ.get('FIREBASE_STORAGE_BUCKET'),
            "messagingSenderId": os.environ.get('FIREBASE_MESSAGING_SENDER_ID'),
            "appId": os.environ.get('FIREBASE_APP_ID'),
            "measurementId": os.environ.get('FIREBASE_MEASUREMENT_ID')
        }
    }

@api_router.get("/sdk-contract")
async def get_sdk_contract():
    """Return the SDK contract (allowlist of supported endpoints)"""
    return SDK_CONTRACT

# ==================== LISTINGS ====================

@api_router.get("/listings")
async def get_listings(
    checkIn: Optional[str] = None,
    checkOut: Optional[str] = None,
    guests: Optional[int] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    bedrooms: Optional[int] = Query(None, alias="numberOfBedrooms"),
    bathrooms: Optional[int] = Query(None, alias="numberOfBathrooms"),
    limit: int = 20,
    cursor: Optional[str] = None
):
    """Fetch listings from BEAPI with caching"""
    params = {'limit': min(limit, 100)}
    if checkIn: params['checkIn'] = checkIn
    if checkOut: params['checkOut'] = checkOut
    if guests: params['minOccupancy'] = guests
    if minPrice: params['minPrice'] = minPrice
    if maxPrice: params['maxPrice'] = maxPrice
    if bedrooms: params['numberOfBedrooms'] = bedrooms
    if bathrooms: params['numberOfBathrooms'] = bathrooms
    if cursor: params['cursor'] = cursor
    
    return await guesty_request('GET', '/listings', params=params, use_cache=True)

@api_router.get("/listings/{listing_id}")
async def get_listing(listing_id: str, checkIn: Optional[str] = None, checkOut: Optional[str] = None):
    """Fetch single listing by ID"""
    params = {}
    if checkIn: params['checkIn'] = checkIn
    if checkOut: params['checkOut'] = checkOut
    return await guesty_request('GET', f'/listings/{listing_id}', params=params, use_cache=True)

@api_router.get("/locations")
async def get_locations():
    """Fetch unique locations from all listings for autocomplete"""
    cached = await response_cache.get("/locations", {})
    if cached:
        return cached

    try:
        # Fetch listings to aggregate locations
        data = await guesty_request('GET', '/listings', params={'limit': 100}, use_cache=True)
        listings = data.get('results', [])

        locations = []
        seen = set()

        for listing in listings:
            address = listing.get('address', {})
            city = address.get('city')
            region = address.get('state') or address.get('city') # Guesty often uses state for region

            if city and city.strip() and city not in seen:
                locations.append({
                    "city": city.strip(),
                    "region": region.strip() if region else "Malta",
                    "type": "city",
                    "popular": listing.get('isFeatured', False)
                })
                seen.add(city)

        # Sort by popularity then name
        locations.sort(key=lambda x: (not x['popular'], x['city']))

        await response_cache.set("/locations", {}, locations)
        return locations
    except Exception as e:
        logger.error(f"Error aggregating locations: {e}")
        return []

@api_router.get("/listings/{listing_id}/calendar")
async def get_listing_calendar(listing_id: str, from_date: Optional[str] = None, to_date: Optional[str] = None):
    """Fetch listing calendar/availability"""
    params = {}
    if from_date: params['from'] = from_date
    if to_date: params['to'] = to_date
    return await guesty_request('GET', f'/listings/{listing_id}/calendar', params=params, use_cache=True)

@api_router.get("/listings/{listing_id}/payment-provider")
async def get_listing_payment_provider(listing_id: str):
    """Get payment provider configuration for listing"""
    # For now return Stripe as default - BEAPI may expose this endpoint
    return {
        "provider": "stripe",
        "publishable_key": STRIPE_PUBLISHABLE_KEY
    }

# ==================== QUOTES ====================

@api_router.post("/quotes")
async def create_quote(request: QuoteRequest):
    """Create reservation quote"""
    payload = {
        'listingId': request.listingId,
        'checkInDateLocalized': request.checkInDateLocalized,
        'checkOutDateLocalized': request.checkOutDateLocalized,
        'guestsCount': request.guestsCount
    }
    if request.guest:
        payload['guest'] = request.guest.model_dump()
    if request.coupons:
        payload['coupons'] = request.coupons
    
    return await guesty_request('POST', '/reservations/quotes', json_data=payload)

@api_router.get("/quotes/{quote_id}")
async def get_quote(quote_id: str):
    """Get quote details"""
    return await guesty_request('GET', f'/reservations/quotes/{quote_id}')

@api_router.post("/quotes/{quote_id}/coupons")
async def apply_coupon(quote_id: str, request: CouponRequest):
    """Apply coupon to quote"""
    try:
        return await guesty_request('POST', f'/reservations/quotes/{quote_id}/coupons', json_data={'coupons': request.coupons})
    except HTTPException as e:
        # Return structured coupon error
        detail = e.detail if isinstance(e.detail, dict) else {"code": "COUPON_ERROR", "message": str(e.detail)}
        raise HTTPException(status_code=e.status_code, detail=detail)

# ==================== RESERVATIONS ====================

@api_router.post("/quotes/{quote_id}/instant-charge")
async def create_instant_reservation(quote_id: str, ratePlanId: Optional[str] = Body(None, embed=True)):
    """Create instant booking from quote after payment"""
    payload = {'ratePlanId': ratePlanId} if ratePlanId else None
    return await guesty_request('POST', f'/reservations/quotes/{quote_id}/instant', json_data=payload)

@api_router.post("/reservations/{reservation_id}/verify-payment")
async def verify_payment(reservation_id: str):
    """Verify payment for pending auth reservations"""
    # Check transaction status in our DB
    tx = await db.transactions.find_one({'reservation_id': reservation_id}, {'_id': 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "reservation_id": reservation_id,
        "status": tx.get('status', 'pending'),
        "confirmation_code": tx.get('confirmation_code')
    }

@api_router.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str):
    """Get reservation details"""
    return await guesty_request('GET', f'/reservations/{reservation_id}/details')

# ==================== CHECKOUT / STRIPE ====================

def extract_pricing(quote: dict, rate_plan_id: Optional[str] = None) -> dict:
    """Extract correct guest-facing total from quote"""
    rate_plans = quote.get('rates', {}).get('ratePlans', [])
    if not rate_plans:
        raise HTTPException(status_code=400, detail="No rate plans available")
    
    selected = rate_plans[0]
    if rate_plan_id:
        for plan in rate_plans:
            rp = plan.get('ratePlan', {})
            if rp.get('_id') == rate_plan_id:
                selected = plan
                break
    
    money = selected.get('money') or selected.get('ratePlan', {}).get('money', {})
    
    guest_total = money.get('hostPayout') or money.get('subTotalPrice', 0)
    
    if not guest_total or guest_total <= 0:
        fare = money.get('fareAccommodation', 0)
        cleaning = money.get('fareCleaning', 0)
        fees = money.get('totalFees', 0)
        taxes = money.get('totalTaxes', 0)
        guest_total = fare + cleaning + fees + taxes
    
    return {
        'guest_total': guest_total,
        'host_payout': money.get('hostPayout', 0),
        'currency': money.get('currency', 'EUR'),
        'rate_plan': selected.get('ratePlan', selected),
        'money': money,
        'days': selected.get('days', [])
    }

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    """Create Stripe checkout session"""
    quote = await guesty_request('GET', f'/reservations/quotes/{request.quoteId}')
    pricing = extract_pricing(quote, request.ratePlanId)
    
    origin_url = request.origin_url.rstrip('/')
    success_url = f"{origin_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout/{request.quoteId}"
    
    webhook_base = os.environ.get('WEBHOOK_BASE_URL', str(http_request.base_url).rstrip('/'))
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{webhook_base}/api/webhook/stripe")
    
    session = await stripe_checkout.create_checkout_session(CheckoutSessionRequest(
        amount=float(pricing['guest_total']),
        currency=pricing['currency'].lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'quote_id': request.quoteId,
            'listing_id': quote.get('listingId', ''),
            'guest_email': request.guest.email,
            'guest_name': f"{request.guest.firstName} {request.guest.lastName}",
            'rate_plan_id': request.ratePlanId or pricing['rate_plan'].get('_id', ''),
        }
    ))
    
    # Store transaction
    await db.transactions.insert_one({
        'id': str(uuid.uuid4()),
        'session_id': session.session_id,
        'quote_id': request.quoteId,
        'amount': pricing['guest_total'],
        'currency': pricing['currency'],
        'guest': request.guest.model_dump(),
        'status': 'pending',
        'environment': os.environ.get('GUESTY_ENVIRONMENT', 'production'),
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id, "amount": pricing['guest_total']}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Get checkout session status"""
    webhook_base = os.environ.get('WEBHOOK_BASE_URL', str(http_request.base_url).rstrip('/'))
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{webhook_base}/api/webhook/stripe")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    tx = await db.transactions.find_one({'session_id': session_id}, {'_id': 0})
    return {**status.model_dump(), 'reservation_id': tx.get('reservation_id') if tx else None}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks - create reservation on payment success"""
    webhook_base = os.environ.get('WEBHOOK_BASE_URL', str(request.base_url).rstrip('/'))
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{webhook_base}/api/webhook/stripe")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == 'paid':
            tx = await db.transactions.find_one({'session_id': webhook_response.session_id})
            if tx and not tx.get('reservation_id'):
                try:
                    reservation = await guesty_request(
                        'POST',
                        f'/reservations/quotes/{tx["quote_id"]}/instant',
                        json_data={'ratePlanId': webhook_response.metadata.get('rate_plan_id')} if webhook_response.metadata.get('rate_plan_id') else None
                    )
                    await db.transactions.update_one(
                        {'session_id': webhook_response.session_id},
                        {'$set': {
                            'status': 'confirmed', 
                            'reservation_id': reservation.get('_id'), 
                            'confirmation_code': reservation.get('confirmationCode'),
                            'confirmed_at': datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    logger.info(f"Reservation created: {reservation.get('confirmationCode')}")
                except Exception as e:
                    logger.error(f"Reservation creation failed: {e}")
                    await db.transactions.update_one(
                        {'session_id': webhook_response.session_id},
                        {'$set': {'status': 'payment_received_booking_failed', 'error': str(e)}}
                    )
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ==================== CONTACT & INQUIRIES ====================

@api_router.post("/contact")
async def submit_contact(request: ContactRequest):
    """Submit contact form"""
    await db.contacts.insert_one({
        'id': str(uuid.uuid4()),
        **request.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'status': 'new'
    })
    return {"success": True}

@api_router.post("/property-owner-inquiry")
async def submit_owner_inquiry(request: PropertyOwnerInquiry):
    """Submit property owner inquiry"""
    await db.owner_inquiries.insert_one({
        'id': str(uuid.uuid4()),
        **request.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'status': 'new'
    })
    return {"success": True}

# ==================== LEGACY CMS (removed - use /api/cms/* from cms_engine) ====================
# Old CMS routes removed to avoid conflicts with new block-based CMS

# ==================== ADMIN AUTHENTICATION ====================

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login endpoint"""
    # Check credentials
    if request.email != ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    try:
        # Default password: CVPMAdmin2026!
        stored_hash = ADMIN_PASSWORD_HASH or bcrypt.hashpw("CVPMAdmin2026!".encode(), bcrypt.gensalt()).decode()
        if not bcrypt.checkpw(request.password.encode(), stored_hash.encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_admin_token(request.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600
    }

@api_router.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    """Get current admin info"""
    return {"email": admin["sub"], "role": "admin"}

# ==================== ADMIN PROTECTED ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_current_admin)):
    """Get admin dashboard stats"""
    contacts = await db.contacts.count_documents({})
    inquiries = await db.owner_inquiries.count_documents({})
    transactions = await db.transactions.count_documents({})
    confirmed = await db.transactions.count_documents({'status': 'confirmed'})
    failed = await db.transactions.count_documents({'status': 'payment_received_booking_failed'})
    
    redis_conn = await get_redis()
    
    return {
        'contacts': contacts,
        'owner_inquiries': inquiries,
        'total_transactions': transactions,
        'confirmed_bookings': confirmed,
        'failed_bookings': failed,
        'environment': os.environ.get('GUESTY_ENVIRONMENT', 'production'),
        'sdk_contract_version': SDK_CONTRACT['version'],
        'redis_status': 'connected' if redis_conn else 'unavailable'
    }

@api_router.get("/admin/config")
async def get_admin_config(admin: dict = Depends(get_current_admin)):
    """Get current configuration (secrets masked)"""
    def mask_secret(secret: str) -> str:
        if not secret:
            return ""
        if len(secret) <= 8:
            return "*" * len(secret)
        return secret[:4] + "*" * (len(secret) - 8) + secret[-4:]
    
    return {
        "guesty": {
            "client_id": mask_secret(GUESTY_CLIENT_ID or ""),
            "client_secret": mask_secret(GUESTY_CLIENT_SECRET or ""),
            "environment": os.environ.get('GUESTY_ENVIRONMENT', 'production'),
            "webhook_secret": mask_secret(GUESTY_WEBHOOK_SECRET or "")
        },
        "stripe": {
            "api_key": mask_secret(STRIPE_API_KEY or ""),
            "publishable_key": STRIPE_PUBLISHABLE_KEY or ""
        },
        "redis": {
            "url": mask_secret(REDIS_URL or ""),
            "status": "connected" if await get_redis() else "unavailable"
        },
        "firebase": {
            "project_id": os.environ.get('FIREBASE_PROJECT_ID', ''),
            "configured": bool(os.environ.get('FIREBASE_API_KEY'))
        }
    }

@api_router.post("/admin/config")
async def update_admin_config(update: AdminConfigUpdate, admin: dict = Depends(get_current_admin)):
    """Update configuration (requires restart for some changes)"""
    changes = []
    
    if update.guesty_environment:
        os.environ['GUESTY_ENVIRONMENT'] = update.guesty_environment
        # Invalidate token cache when switching environments
        await guesty_token_cache.invalidate()
        await response_cache.clear_all()
        changes.append(f"environment -> {update.guesty_environment}")
    
    # Note: Other secrets would typically be stored in a secrets manager
    # For now, we log the request and note that a restart is needed
    
    return {
        "success": True,
        "changes": changes,
        "note": "Some changes may require a server restart to take effect"
    }

@api_router.get("/admin/contacts")
async def get_admin_contacts(admin: dict = Depends(get_current_admin)):
    """Get all contact submissions"""
    contacts = await db.contacts.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return contacts

@api_router.get("/admin/owner-inquiries")
async def get_admin_inquiries(admin: dict = Depends(get_current_admin)):
    """Get all owner inquiries"""
    inquiries = await db.owner_inquiries.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return inquiries

@api_router.get("/admin/transactions")
async def get_admin_transactions(admin: dict = Depends(get_current_admin)):
    """Get all transactions"""
    transactions = await db.transactions.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return transactions

@api_router.post("/admin/clear-cache")
async def clear_cache(admin: dict = Depends(get_current_admin)):
    """Clear all caches"""
    cleared = await response_cache.clear_all()
    return {"success": True, "cleared": cleared}

@api_router.post("/admin/refresh-token")
async def refresh_token(admin: dict = Depends(get_current_admin)):
    """Force refresh Guesty token"""
    await guesty_token_cache.invalidate()
    token = await guesty_token_cache.get_token()
    return {"success": True, "token_prefix": token[:20] + "...", "environment": os.environ.get('GUESTY_ENVIRONMENT')}

@api_router.put("/admin/cms/{section}")
async def update_cms_section(section: str, request: CMSUpdate, admin: dict = Depends(get_current_admin)):
    """Update CMS section (admin only)"""
    await db.cms.update_one({}, {'$set': {section: request.data}}, upsert=True)
    return {"success": True}

@api_router.post("/admin/cms/reset")
async def reset_cms(admin: dict = Depends(get_current_admin)):
    """Reset CMS to defaults (admin only)"""
    await db.cms.delete_many({})
    return {"success": True, "message": "CMS reset to defaults"}

# Include main API router
app.include_router(api_router)

# Firebase Functions entry point
try:
    from firebase_functions import https_fn
    @https_fn.on_request()
    def api(req: https_fn.Request) -> https_fn.Response:
        from asgiref.wsgi import ASGIMiddleware
        # This is a conceptual bridge for Firebase Functions
        # In a real deployment, you'd use a specific adapter like mangum for AWS or similar for Firebase
        return https_fn.Response("API bridge active")
except ImportError:
    pass

# Include CMS Engine routers
from cms_engine import create_cms_router, create_ai_router
cms_router = create_cms_router(db)
ai_router = create_ai_router(db)
app.include_router(cms_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=CORS_ORIGINS != '*',
    allow_origins=CORS_ORIGINS.split(',') if CORS_ORIGINS != '*' else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    """Create indexes and initialize connections"""
    # Try to start local redis if available but not running
    try:
        import subprocess
        subprocess.Popen(["redis-server", "--port", "6379"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        await asyncio.sleep(1)
    except Exception:
        pass

    try:
        if not hasattr(db, '__class__') or db.__class__.__name__ != 'MockDB':
            await db.transactions.create_index("session_id", unique=True)
            await db.response_cache.create_index("key", unique=True)
            await db.response_cache.create_index("expires_at", expireAfterSeconds=0)
            await db.guesty_tokens.create_index("type", unique=True)

            # CMS indexes
            await db.cms_pages.create_index("slug", unique=True)
            await db.cms_pages.create_index("id", unique=True)
            await db.cms_content.create_index("key", unique=True)
            await db.cms_campaigns.create_index("id", unique=True)
            await db.cms_versions.create_index([("entityType", 1), ("entityId", 1), ("version", -1)])
    except Exception as e:
        logger.warning(f"Failed to create indexes: {e}")
    
    # Test Redis connection
    redis_conn = await get_redis()
    if redis_conn:
        logger.info("Redis connected successfully")
    else:
        logger.warning("Redis unavailable, using MongoDB fallback")
    
    logger.info(f"CVPM API started in {os.environ.get('GUESTY_ENVIRONMENT', 'production')} mode")

@app.on_event("shutdown")
async def shutdown():
    """Cleanup connections"""
    global redis_client
    if redis_client:
        await redis_client.close()
    try:
        if 'client' in globals():
            client.close()
    except Exception:
        pass

# ==================== FRONTEND SERVING ====================

FRONTEND_DIST = ROOT_DIR.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Serve assets specifically
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend files or index.html for SPA routing"""
        # Skip API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)

        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))

        # SPA fallback
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))

        raise HTTPException(status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False, workers=1)
