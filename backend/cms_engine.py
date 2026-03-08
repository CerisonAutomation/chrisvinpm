"""
CVPM Enterprise CMS Engine
==========================
AI-Powered Block-Based Content Management System

Features:
- Block-based page builder (Hero, Features, Testimonials, CTA, etc.)
- Theme Factory with holiday/seasonal presets
- AI content generation (OpenAI, Claude, Gemini)
- Marketing automation (popups, banners, A/B testing)
- Version control with rollback
- Multi-language support
- SEO optimization
- Analytics integration
"""

from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal, Union
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import json
import os
import asyncio
from enum import Enum

# ==================== BLOCK TYPES ====================

class BlockType(str, Enum):
    HERO = "hero"
    FEATURES = "features"
    TESTIMONIALS = "testimonials"
    CTA = "cta"
    GALLERY = "gallery"
    PRICING = "pricing"
    FAQ = "faq"
    STATS = "stats"
    TEAM = "team"
    CONTACT = "contact"
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    BANNER = "banner"
    POPUP = "popup"
    COUNTDOWN = "countdown"
    PROPERTY_GRID = "property_grid"
    MAP = "map"
    REVIEWS = "reviews"
    NEWSLETTER = "newsletter"
    SOCIAL_PROOF = "social_proof"
    TRUST_BADGES = "trust_badges"
    COMPARISON = "comparison"
    TIMELINE = "timeline"
    CUSTOM_HTML = "custom_html"

# ==================== THEME SYSTEM ====================

class ThemePreset(str, Enum):
    DEFAULT = "default"
    LUXURY_DARK = "luxury_dark"
    LUXURY_LIGHT = "luxury_light"
    CHRISTMAS = "christmas"
    NEW_YEAR = "new_year"
    VALENTINES = "valentines"
    EASTER = "easter"
    SUMMER = "summer"
    AUTUMN = "autumn"
    WINTER = "winter"
    HALLOWEEN = "halloween"
    BLACK_FRIDAY = "black_friday"
    CYBER_MONDAY = "cyber_monday"
    MINIMALIST = "minimalist"
    CORPORATE = "corporate"
    TROPICAL = "tropical"
    MEDITERRANEAN = "mediterranean"

THEME_CONFIGS = {
    "default": {
        "name": "Default Dark Luxury",
        "colors": {
            "primary": "#F59E0B",
            "primary-foreground": "#000000",
            "secondary": "#1A1A1C",
            "background": "#0F0F10",
            "foreground": "#FFFFFF",
            "muted": "#27272A",
            "accent": "#D97706",
            "card": "#1A1A1C",
            "border": "#2A2A2C",
        },
        "fonts": {
            "heading": "Inter",
            "body": "Inter",
        },
        "borderRadius": "0.5rem",
    },
    "luxury_dark": {
        "name": "Luxury Dark Gold",
        "colors": {
            "primary": "#D4AF37",
            "primary-foreground": "#000000",
            "secondary": "#1C1C1E",
            "background": "#0A0A0B",
            "foreground": "#F5F5F5",
            "muted": "#2C2C2E",
            "accent": "#C9A227",
            "card": "#161618",
            "border": "#3A3A3C",
        },
        "fonts": {"heading": "Playfair Display", "body": "Inter"},
        "borderRadius": "0.25rem",
    },
    "christmas": {
        "name": "Christmas Holiday",
        "colors": {
            "primary": "#C41E3A",
            "primary-foreground": "#FFFFFF",
            "secondary": "#165B33",
            "background": "#0F1A14",
            "foreground": "#FFFFFF",
            "muted": "#1E3A2B",
            "accent": "#BB2528",
            "card": "#1A2E23",
            "border": "#2D4A3A",
        },
        "fonts": {"heading": "Playfair Display", "body": "Inter"},
        "borderRadius": "0.75rem",
        "decorations": ["snowflakes", "lights"],
    },
    "summer": {
        "name": "Summer Vibes",
        "colors": {
            "primary": "#0EA5E9",
            "primary-foreground": "#FFFFFF",
            "secondary": "#F97316",
            "background": "#FFFBEB",
            "foreground": "#1E293B",
            "muted": "#FEF3C7",
            "accent": "#06B6D4",
            "card": "#FFFFFF",
            "border": "#E2E8F0",
        },
        "fonts": {"heading": "Poppins", "body": "Inter"},
        "borderRadius": "1rem",
    },
    "black_friday": {
        "name": "Black Friday Sale",
        "colors": {
            "primary": "#EF4444",
            "primary-foreground": "#FFFFFF",
            "secondary": "#000000",
            "background": "#0C0C0C",
            "foreground": "#FFFFFF",
            "muted": "#1A1A1A",
            "accent": "#F59E0B",
            "card": "#141414",
            "border": "#2A2A2A",
        },
        "fonts": {"heading": "Impact", "body": "Inter"},
        "borderRadius": "0",
        "effects": ["flash", "urgency"],
    },
    "mediterranean": {
        "name": "Mediterranean Malta",
        "colors": {
            "primary": "#0369A1",
            "primary-foreground": "#FFFFFF",
            "secondary": "#CA8A04",
            "background": "#FEF9E7",
            "foreground": "#1E3A5F",
            "muted": "#E8E4D9",
            "accent": "#0284C7",
            "card": "#FFFFFF",
            "border": "#D1C7B7",
        },
        "fonts": {"heading": "Lora", "body": "Open Sans"},
        "borderRadius": "0.5rem",
    },
}

# ==================== BLOCK SCHEMAS ====================

class BaseBlock(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: BlockType
    order: int = 0
    visible: bool = True
    settings: Dict[str, Any] = {}
    styles: Dict[str, Any] = {}
    animations: Dict[str, Any] = {}
    abTest: Optional[Dict[str, Any]] = None

class HeroBlock(BaseBlock):
    type: BlockType = BlockType.HERO
    content: Dict[str, Any] = {
        "headline": "Luxury Stays in Malta",
        "subheadline": "Experience the Mediterranean lifestyle",
        "backgroundImage": "",
        "backgroundVideo": "",
        "ctaText": "Book Now",
        "ctaLink": "/properties",
        "secondaryCta": {"text": "Learn More", "link": "#about"},
        "overlay": {"enabled": True, "opacity": 0.5, "color": "#000000"},
        "searchWidget": {"enabled": True, "style": "floating"},
    }

class FeaturesBlock(BaseBlock):
    type: BlockType = BlockType.FEATURES
    content: Dict[str, Any] = {
        "headline": "Why Choose Us",
        "subheadline": "Premium property management services",
        "features": [
            {"icon": "shield", "title": "Verified Properties", "description": "All properties are personally inspected"},
            {"icon": "clock", "title": "24/7 Support", "description": "Round-the-clock guest assistance"},
            {"icon": "star", "title": "Best Prices", "description": "Price match guarantee"},
        ],
        "layout": "grid",  # grid, list, carousel
        "columns": 3,
    }

class TestimonialsBlock(BaseBlock):
    type: BlockType = BlockType.TESTIMONIALS
    content: Dict[str, Any] = {
        "headline": "What Our Guests Say",
        "testimonials": [],
        "layout": "carousel",
        "autoplay": True,
        "showRating": True,
    }

class CTABlock(BaseBlock):
    type: BlockType = BlockType.CTA
    content: Dict[str, Any] = {
        "headline": "Ready to Book?",
        "subheadline": "Find your perfect Mediterranean getaway",
        "primaryCta": {"text": "Browse Properties", "link": "/properties"},
        "secondaryCta": {"text": "Contact Us", "action": "openContactModal"},
        "backgroundImage": "",
        "style": "centered",
    }

class BannerBlock(BaseBlock):
    type: BlockType = BlockType.BANNER
    content: Dict[str, Any] = {
        "text": "🎉 Special Offer: 20% off summer bookings!",
        "link": "/properties?promo=summer20",
        "dismissible": True,
        "position": "top",
        "schedule": {"start": None, "end": None},
        "targetAudience": "all",
    }

class PopupBlock(BaseBlock):
    type: BlockType = BlockType.POPUP
    content: Dict[str, Any] = {
        "headline": "Get 10% Off Your First Booking",
        "body": "Subscribe to our newsletter and receive an exclusive discount code.",
        "form": {"type": "newsletter", "fields": ["email"]},
        "image": "",
        "trigger": "exit_intent",  # exit_intent, scroll, time_delay, click
        "delay": 5000,
        "frequency": "once_per_session",
    }

class CountdownBlock(BaseBlock):
    type: BlockType = BlockType.COUNTDOWN
    content: Dict[str, Any] = {
        "headline": "Limited Time Offer",
        "endDate": "",
        "completedAction": "hide",
        "style": "minimal",
    }

# ==================== PAGE & SITE STRUCTURE ====================

class PageBlock(BaseModel):
    blockId: str
    blockType: BlockType
    content: Dict[str, Any]
    settings: Dict[str, Any] = {}
    styles: Dict[str, Any] = {}
    animations: Dict[str, Any] = {}
    visible: bool = True
    order: int = 0

class Page(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    description: str = ""
    blocks: List[PageBlock] = []
    seo: Dict[str, Any] = {
        "title": "",
        "description": "",
        "keywords": [],
        "ogImage": "",
    }
    settings: Dict[str, Any] = {}
    published: bool = False
    publishedAt: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteConfig(BaseModel):
    id: str = "site_config"
    name: str = "CVPM"
    tagline: str = "Christiano Vincenti Property Management"
    logo: str = ""
    favicon: str = ""
    theme: str = "default"
    customTheme: Optional[Dict[str, Any]] = None
    navigation: List[Dict[str, Any]] = []
    footer: Dict[str, Any] = {}
    contact: Dict[str, Any] = {
        "email": "info@christianopropertymanagement.com",
        "phone": "+356 7979 0202",
        "address": "Malta",
    }
    social: Dict[str, Any] = {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "linkedin": "",
    }
    analytics: Dict[str, Any] = {
        "googleAnalytics": "",
        "facebookPixel": "",
        "hotjar": "",
    }
    integrations: Dict[str, Any] = {
        "stripe": {"enabled": True},
        "guesty": {"enabled": True},
        "firebase": {"enabled": True},
    }
    globalScripts: Dict[str, Any] = {
        "head": "",
        "bodyStart": "",
        "bodyEnd": "",
    }
    features: Dict[str, Any] = {
        "maintenance": False,
        "comingSoon": False,
        "multiLanguage": False,
        "darkMode": True,
    }

# ==================== AI CONTENT GENERATION ====================

class AIContentRequest(BaseModel):
    type: Literal["headline", "description", "cta", "full_block", "seo", "email", "social"]
    context: Dict[str, Any]
    tone: Literal["professional", "casual", "luxury", "friendly", "urgent"] = "luxury"
    language: str = "en"
    length: Literal["short", "medium", "long"] = "medium"

class AIContentResponse(BaseModel):
    content: Dict[str, Any]
    suggestions: List[str] = []
    tokens_used: int = 0

# ==================== MARKETING AUTOMATION ====================

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: Literal["banner", "popup", "email", "push", "social"]
    status: Literal["draft", "scheduled", "active", "paused", "completed"] = "draft"
    content: Dict[str, Any]
    targeting: Dict[str, Any] = {
        "audience": "all",
        "devices": ["desktop", "mobile"],
        "countries": [],
        "pages": [],
    }
    schedule: Dict[str, Any] = {
        "start": None,
        "end": None,
        "timezone": "UTC",
    }
    metrics: Dict[str, Any] = {
        "impressions": 0,
        "clicks": 0,
        "conversions": 0,
    }
    abVariants: List[Dict[str, Any]] = []
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ABTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    status: Literal["draft", "running", "completed"] = "draft"
    variants: List[Dict[str, Any]]
    metrics: Dict[str, Any] = {}
    winner: Optional[str] = None
    confidence: float = 0.0
    sampleSize: int = 0
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== VERSION CONTROL ====================

class ContentVersion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entityType: Literal["page", "block", "site_config", "theme"]
    entityId: str
    version: int
    data: Dict[str, Any]
    changeLog: str = ""
    author: str = "admin"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== CMS ROUTER ====================

def create_cms_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/cms", tags=["CMS"])
    
    # ========== SITE CONFIG ==========
    
    @router.get("/site")
    async def get_site_config():
        """Get site configuration"""
        config = await db.cms_site.find_one({"id": "site_config"}, {"_id": 0})
        if not config:
            default = SiteConfig()
            await db.cms_site.insert_one(default.model_dump())
            return default.model_dump()
        return config
    
    @router.put("/site")
    async def update_site_config(config: Dict[str, Any] = Body(...)):
        """Update site configuration"""
        config["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await db.cms_site.update_one(
            {"id": "site_config"},
            {"$set": config},
            upsert=True
        )
        return {"success": True}
    
    # ========== THEMES ==========
    
    @router.get("/themes")
    async def get_themes():
        """Get all available themes"""
        custom_themes = await db.cms_themes.find({}, {"_id": 0}).to_list(100)
        return {
            "presets": THEME_CONFIGS,
            "custom": custom_themes,
        }
    
    @router.get("/themes/{theme_id}")
    async def get_theme(theme_id: str):
        """Get theme by ID"""
        if theme_id in THEME_CONFIGS:
            return THEME_CONFIGS[theme_id]
        custom = await db.cms_themes.find_one({"id": theme_id}, {"_id": 0})
        if not custom:
            raise HTTPException(404, "Theme not found")
        return custom
    
    @router.post("/themes")
    async def create_theme(theme: Dict[str, Any] = Body(...)):
        """Create custom theme"""
        theme["id"] = str(uuid.uuid4())
        theme["createdAt"] = datetime.now(timezone.utc).isoformat()
        await db.cms_themes.insert_one(theme)
        return {"id": theme["id"]}
    
    @router.put("/themes/{theme_id}")
    async def update_theme(theme_id: str, theme: Dict[str, Any] = Body(...)):
        """Update custom theme"""
        theme["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await db.cms_themes.update_one(
            {"id": theme_id},
            {"$set": theme},
            upsert=True
        )
        return {"success": True}
    
    # ========== PAGES ==========
    
    @router.get("/pages")
    async def get_pages():
        """Get all pages"""
        pages = await db.cms_pages.find({}, {"_id": 0}).to_list(100)
        return pages
    
    @router.get("/pages/{page_id}")
    async def get_page(page_id: str):
        """Get page by ID or slug"""
        page = await db.cms_pages.find_one(
            {"$or": [{"id": page_id}, {"slug": page_id}]},
            {"_id": 0}
        )
        if not page:
            raise HTTPException(404, "Page not found")
        return page
    
    @router.post("/pages")
    async def create_page(page: Dict[str, Any] = Body(...)):
        """Create new page"""
        page["id"] = str(uuid.uuid4())
        page["createdAt"] = datetime.now(timezone.utc).isoformat()
        page["updatedAt"] = page["createdAt"]
        await db.cms_pages.insert_one(page)
        return {"id": page["id"]}
    
    @router.put("/pages/{page_id}")
    async def update_page(page_id: str, page: Dict[str, Any] = Body(...)):
        """Update page"""
        page["updatedAt"] = datetime.now(timezone.utc).isoformat()
        
        # Save version
        existing = await db.cms_pages.find_one({"id": page_id}, {"_id": 0})
        if existing:
            version_count = await db.cms_versions.count_documents({"entityId": page_id})
            await db.cms_versions.insert_one({
                "id": str(uuid.uuid4()),
                "entityType": "page",
                "entityId": page_id,
                "version": version_count + 1,
                "data": existing,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            })
        
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$set": page},
            upsert=True
        )
        return {"success": True}
    
    @router.delete("/pages/{page_id}")
    async def delete_page(page_id: str):
        """Delete page"""
        await db.cms_pages.delete_one({"id": page_id})
        return {"success": True}
    
    @router.post("/pages/{page_id}/publish")
    async def publish_page(page_id: str):
        """Publish page"""
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$set": {
                "published": True,
                "publishedAt": datetime.now(timezone.utc).isoformat(),
            }}
        )
        return {"success": True}
    
    @router.post("/pages/{page_id}/unpublish")
    async def unpublish_page(page_id: str):
        """Unpublish page"""
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$set": {"published": False}}
        )
        return {"success": True}
    
    # ========== BLOCKS ==========
    
    @router.get("/blocks/templates")
    async def get_block_templates():
        """Get available block templates"""
        return {
            "blocks": [
                {"type": "hero", "name": "Hero Section", "description": "Full-width hero with headline and CTA"},
                {"type": "features", "name": "Features Grid", "description": "Highlight key features"},
                {"type": "testimonials", "name": "Testimonials", "description": "Customer reviews carousel"},
                {"type": "cta", "name": "Call to Action", "description": "Conversion-focused CTA section"},
                {"type": "gallery", "name": "Image Gallery", "description": "Photo gallery with lightbox"},
                {"type": "pricing", "name": "Pricing Table", "description": "Pricing plans comparison"},
                {"type": "faq", "name": "FAQ Accordion", "description": "Frequently asked questions"},
                {"type": "stats", "name": "Statistics", "description": "Key metrics display"},
                {"type": "team", "name": "Team Section", "description": "Team member profiles"},
                {"type": "contact", "name": "Contact Form", "description": "Contact information and form"},
                {"type": "banner", "name": "Promotional Banner", "description": "Site-wide announcement"},
                {"type": "popup", "name": "Popup Modal", "description": "Marketing popup"},
                {"type": "countdown", "name": "Countdown Timer", "description": "Limited offer countdown"},
                {"type": "property_grid", "name": "Property Grid", "description": "Featured listings display"},
                {"type": "newsletter", "name": "Newsletter Signup", "description": "Email subscription form"},
                {"type": "social_proof", "name": "Social Proof", "description": "Live booking notifications"},
                {"type": "trust_badges", "name": "Trust Badges", "description": "Security and trust indicators"},
            ]
        }
    
    @router.post("/pages/{page_id}/blocks")
    async def add_block_to_page(page_id: str, block: Dict[str, Any] = Body(...)):
        """Add block to page"""
        block["blockId"] = str(uuid.uuid4())
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$push": {"blocks": block}}
        )
        return {"blockId": block["blockId"]}
    
    @router.put("/pages/{page_id}/blocks/{block_id}")
    async def update_block(page_id: str, block_id: str, block: Dict[str, Any] = Body(...)):
        """Update block in page"""
        await db.cms_pages.update_one(
            {"id": page_id, "blocks.blockId": block_id},
            {"$set": {"blocks.$": block}}
        )
        return {"success": True}
    
    @router.delete("/pages/{page_id}/blocks/{block_id}")
    async def delete_block(page_id: str, block_id: str):
        """Remove block from page"""
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$pull": {"blocks": {"blockId": block_id}}}
        )
        return {"success": True}
    
    @router.put("/pages/{page_id}/blocks/reorder")
    async def reorder_blocks(page_id: str, order: List[str] = Body(...)):
        """Reorder blocks in page"""
        page = await db.cms_pages.find_one({"id": page_id})
        if not page:
            raise HTTPException(404, "Page not found")
        
        blocks = page.get("blocks", [])
        block_map = {b["blockId"]: b for b in blocks}
        reordered = [block_map[bid] for bid in order if bid in block_map]
        
        for i, block in enumerate(reordered):
            block["order"] = i
        
        await db.cms_pages.update_one(
            {"id": page_id},
            {"$set": {"blocks": reordered}}
        )
        return {"success": True}
    
    # ========== CAMPAIGNS (Marketing) ==========
    
    @router.get("/campaigns")
    async def get_campaigns():
        """Get all marketing campaigns"""
        campaigns = await db.cms_campaigns.find({}, {"_id": 0}).to_list(100)
        return campaigns
    
    @router.post("/campaigns")
    async def create_campaign(campaign: Dict[str, Any] = Body(...)):
        """Create marketing campaign"""
        campaign["id"] = str(uuid.uuid4())
        campaign["createdAt"] = datetime.now(timezone.utc).isoformat()
        await db.cms_campaigns.insert_one(campaign)
        return {"id": campaign["id"]}
    
    @router.put("/campaigns/{campaign_id}")
    async def update_campaign(campaign_id: str, campaign: Dict[str, Any] = Body(...)):
        """Update marketing campaign"""
        await db.cms_campaigns.update_one(
            {"id": campaign_id},
            {"$set": campaign},
            upsert=True
        )
        return {"success": True}
    
    @router.post("/campaigns/{campaign_id}/activate")
    async def activate_campaign(campaign_id: str):
        """Activate campaign"""
        await db.cms_campaigns.update_one(
            {"id": campaign_id},
            {"$set": {"status": "active"}}
        )
        return {"success": True}
    
    @router.post("/campaigns/{campaign_id}/pause")
    async def pause_campaign(campaign_id: str):
        """Pause campaign"""
        await db.cms_campaigns.update_one(
            {"id": campaign_id},
            {"$set": {"status": "paused"}}
        )
        return {"success": True}
    
    # ========== A/B TESTING ==========
    
    @router.get("/ab-tests")
    async def get_ab_tests():
        """Get all A/B tests"""
        tests = await db.cms_abtests.find({}, {"_id": 0}).to_list(100)
        return tests
    
    @router.post("/ab-tests")
    async def create_ab_test(test: Dict[str, Any] = Body(...)):
        """Create A/B test"""
        test["id"] = str(uuid.uuid4())
        test["createdAt"] = datetime.now(timezone.utc).isoformat()
        await db.cms_abtests.insert_one(test)
        return {"id": test["id"]}
    
    @router.post("/ab-tests/{test_id}/record")
    async def record_ab_event(
        test_id: str, 
        variant: str = Body(..., embed=True),
        event: str = Body(..., embed=True)
    ):
        """Record A/B test event"""
        await db.cms_abtests.update_one(
            {"id": test_id},
            {"$inc": {f"metrics.{variant}.{event}": 1}}
        )
        return {"success": True}
    
    # ========== VERSIONS ==========
    
    @router.get("/versions/{entity_type}/{entity_id}")
    async def get_versions(entity_type: str, entity_id: str):
        """Get version history"""
        versions = await db.cms_versions.find(
            {"entityType": entity_type, "entityId": entity_id},
            {"_id": 0}
        ).sort("version", -1).to_list(50)
        return versions
    
    @router.post("/versions/{version_id}/restore")
    async def restore_version(version_id: str):
        """Restore to previous version"""
        version = await db.cms_versions.find_one({"id": version_id}, {"_id": 0})
        if not version:
            raise HTTPException(404, "Version not found")
        
        collection_map = {
            "page": db.cms_pages,
            "site_config": db.cms_site,
            "theme": db.cms_themes,
        }
        
        collection = collection_map.get(version["entityType"])
        if collection:
            await collection.update_one(
                {"id": version["entityId"]},
                {"$set": version["data"]}
            )
        
        return {"success": True}
    
    # ========== MEDIA ==========
    
    @router.get("/media")
    async def get_media():
        """Get all media files"""
        media = await db.cms_media.find({}, {"_id": 0}).to_list(500)
        return media
    
    @router.post("/media")
    async def upload_media(file: UploadFile = File(...)):
        """Upload media file"""
        # In production, upload to cloud storage (S3, Firebase Storage, etc.)
        media = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "contentType": file.content_type,
            "size": 0,
            "url": f"/uploads/{file.filename}",  # Placeholder
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        await db.cms_media.insert_one(media)
        return media
    
    # ========== GLOBAL CONTENT (editable strings) ==========
    
    @router.get("/content")
    async def get_global_content():
        """Get all global content strings"""
        content = await db.cms_content.find({}, {"_id": 0}).to_list(1000)
        return {c["key"]: c["value"] for c in content}
    
    @router.put("/content")
    async def update_global_content(content: Dict[str, Any] = Body(...)):
        """Update global content strings"""
        for key, value in content.items():
            await db.cms_content.update_one(
                {"key": key},
                {"$set": {"key": key, "value": value, "updatedAt": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )
        return {"success": True}
    
    @router.get("/content/{key}")
    async def get_content_by_key(key: str):
        """Get content by key"""
        content = await db.cms_content.find_one({"key": key}, {"_id": 0})
        return content
    
    return router


# ==================== AI CONTENT ENGINE ====================

def create_ai_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/ai", tags=["AI"])
    
    async def generate_with_openai(prompt: str, model: str = "gpt-4o") -> str:
        """Generate content with OpenAI"""
        import openai
        client = openai.AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    
    async def generate_with_claude(prompt: str) -> str:
        """Generate content with Claude"""
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
    
    @router.post("/generate")
    async def generate_content(request: AIContentRequest):
        """Generate content using AI"""
        tone_instructions = {
            "professional": "Use professional, business-appropriate language.",
            "casual": "Use friendly, conversational language.",
            "luxury": "Use elegant, sophisticated language that evokes exclusivity and premium quality.",
            "friendly": "Use warm, welcoming language.",
            "urgent": "Create a sense of urgency and scarcity.",
        }
        
        length_instructions = {
            "short": "Keep it concise, under 50 words.",
            "medium": "Aim for 50-150 words.",
            "long": "Provide detailed content, 150-300 words.",
        }
        
        prompts = {
            "headline": f"""Create a compelling headline for a vacation rental website in Malta.
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
{length_instructions.get(request.length, '')}
Return only the headline text.""",

            "description": f"""Write a property description for a vacation rental in Malta.
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
{length_instructions.get(request.length, '')}
Focus on the unique selling points and create desire.""",

            "cta": f"""Create a call-to-action button text and supporting copy for a vacation rental booking site.
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
Return JSON: {{"button_text": "...", "supporting_text": "..."}}""",

            "full_block": f"""Create content for a website block.
Block type: {request.context.get('blockType', 'hero')}
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
{length_instructions.get(request.length, '')}
Return complete JSON content for this block type.""",

            "seo": f"""Generate SEO metadata for a vacation rental page.
Context: {json.dumps(request.context)}
Return JSON: {{"title": "...", "description": "...", "keywords": [...]}}""",

            "email": f"""Write a marketing email for a vacation rental company.
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
Return JSON: {{"subject": "...", "preview": "...", "body": "..."}}""",

            "social": f"""Create social media post for a vacation rental company.
Context: {json.dumps(request.context)}
Tone: {tone_instructions.get(request.tone, '')}
Return JSON: {{"post": "...", "hashtags": [...]}}"""
        }
        
        prompt = prompts.get(request.type, prompts["description"])
        
        try:
            # Try OpenAI first, fall back to Claude
            if os.environ.get("OPENAI_API_KEY"):
                result = await generate_with_openai(prompt)
            elif os.environ.get("ANTHROPIC_API_KEY"):
                result = await generate_with_claude(prompt)
            else:
                raise HTTPException(500, "No AI provider configured")
            
            # Try to parse as JSON if applicable
            try:
                content = json.loads(result)
            except json.JSONDecodeError:
                content = {"text": result}
            
            return AIContentResponse(content=content, tokens_used=len(prompt.split()))
            
        except Exception as e:
            raise HTTPException(500, f"AI generation failed: {str(e)}")
    
    @router.post("/suggestions")
    async def get_suggestions(context: Dict[str, Any] = Body(...)):
        """Get AI suggestions for improvements"""
        prompt = f"""Analyze this vacation rental website content and suggest improvements:
{json.dumps(context)}

Provide 5 specific, actionable suggestions to improve conversions and user engagement.
Return JSON array of suggestions."""

        try:
            if os.environ.get("OPENAI_API_KEY"):
                result = await generate_with_openai(prompt)
            else:
                result = "AI not configured"
            
            try:
                suggestions = json.loads(result)
            except:
                suggestions = [result]
            
            return {"suggestions": suggestions}
        except Exception as e:
            return {"suggestions": [], "error": str(e)}
    
    @router.post("/translate")
    async def translate_content(
        content: Dict[str, Any] = Body(...),
        target_language: str = Body(...),
    ):
        """Translate content to target language"""
        prompt = f"""Translate this vacation rental website content to {target_language}.
Maintain the tone and marketing effectiveness.
Content: {json.dumps(content)}
Return the translated content in the same JSON structure."""

        try:
            if os.environ.get("OPENAI_API_KEY"):
                result = await generate_with_openai(prompt)
                return json.loads(result)
        except Exception as e:
            raise HTTPException(500, f"Translation failed: {str(e)}")
    
    @router.post("/optimize-seo")
    async def optimize_seo(content: Dict[str, Any] = Body(...)):
        """Optimize content for SEO"""
        prompt = f"""Optimize this vacation rental content for SEO.
Current content: {json.dumps(content)}

Return JSON with:
- optimized_title
- optimized_description  
- suggested_keywords
- readability_score
- suggestions"""

        try:
            if os.environ.get("OPENAI_API_KEY"):
                result = await generate_with_openai(prompt)
                return json.loads(result)
        except Exception as e:
            raise HTTPException(500, f"SEO optimization failed: {str(e)}")
    
    return router
