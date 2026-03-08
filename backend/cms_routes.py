from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import os

router = APIRouter(prefix="/api/cms", tags=["CMS"])

# CMS Collections structure
CMS_COLLECTIONS = {
    "settings": {
        "site_name": "Christiano Property Management",
        "site_description": "Luxury Malta Accommodations",
        "logo": "",
        "logo_white": "",
        "favicon": "",
        "timezone": "Europe/Malta",
        "currency": "EUR",
        "language": "en",
        "analytics": {"google_analytics": "", "facebook_pixel": ""},
        "seo": {"default_title": "", "default_description": "", "default_keywords": ""}
    },
    "theme": {
        "colors": {
            "primary": "#D4AF37",
            "primary_dark": "#B8962F",
            "secondary": "#1A1A1A",
            "accent": "#E5C67D",
            "background": "#0A0A0A",
            "surface": "#161618",
            "text": "#FFFFFF",
            "text_muted": "#9CA3AF",
            "success": "#10B981",
            "error": "#EF4444"
        },
        "fonts": {
            "heading": "Playfair Display",
            "body": "Inter"
        },
        "border_radius": {"sm": "4px", "md": "8px", "lg": "16px"},
        "shadows": {"sm": "0 1px 2px rgba(0,0,0,0.1)", "lg": "0 10px 40px rgba(0,0,0,0.3)"}
    },
    "blocks": [
        {"id": "hero", "type": "hero", "enabled": True, "order": 1},
        {"id": "featured", "type": "featured_properties", "enabled": True, "order": 2},
        {"id": "about", "type": "about", "enabled": True, "order": 3},
        {"id": "services", "type": "services", "enabled": True, "order": 4},
        {"id": "testimonials", "type": "testimonials", "enabled": True, "order": 5},
        {"id": "cta", "type": "cta", "enabled": True, "order": 6},
        {"id": "footer", "type": "footer", "enabled": True, "order": 7}
    ],
    "tags": [
        {"id": "luxury", "name": "Luxury", "color": "#D4AF37"},
        {"id": "beach", "name": "Beach", "color": "#0EA5E9"},
        {"id": "city", "name": "City Center", "color": "#8B5CF6"},
        {"id": "pool", "name": "Pool", "color": "#10B981"},
        {"id": "family", "name": "Family", "color": "#F59E0B"},
        {"id": "romantic", "name": "Romantic", "color": "#EC4899"}
    ],
    "navigation": {
        "main": [
            {"label": "Home", "href": "/", "icon": "home"},
            {"label": "Properties", "href": "/properties", "icon": "building"},
            {"label": "Locations", "href": "/locations", "icon": "map"},
            {"label": "For Owners", "href": "/property-owners", "icon": "key"}
        ],
        "footer": [
            {"label": "About", "href": "/about"},
            {"label": "Contact", "href": "/contact"},
            {"label": "Terms", "href": "/terms"},
            {"label": "Privacy", "href": "/privacy"}
        ]
    },
    "social": {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "linkedin": "",
        "youtube": ""
    },
    "contact": {
        "email": "info@christianoproperty.com",
        "phone": "+356 1234 5678",
        "address": "Malta",
        "whatsapp": ""
    }
}

# In-memory storage (would be MongoDB in production)
cms_data = CMS_COLLECTIONS.copy()

@router.get("/")
async def get_all_cms():
    """Get all CMS content"""
    return cms_data

@router.get("/{section}")
async def get_cms_section(section: str):
    """Get a specific CMS section"""
    if section not in cms_data:
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found")
    return cms_data[section]

@router.put("/{section}")
async def update_cms_section(section: str, data: Dict[Any, Any]):
    """Update a CMS section"""
    if section not in cms_data:
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found")
    cms_data[section] = data
    return {"success": True, "section": section, "updated_at": datetime.utcnow().isoformat()}

@router.post("/{section}/blocks")
async def add_block(section: str, block: Dict[Any, Any]):
    """Add a new block"""
    if "blocks" not in cms_data:
        raise HTTPException(status_code=404, detail="Blocks not found")
    block["id"] = block.get("id", f"block_{len(cms_data['blocks']) + 1}")
    block["created_at"] = datetime.utcnow().isoformat()
    cms_data["blocks"].append(block)
    return {"success": True, "block": block}

@router.delete("/{section}/blocks/{block_id}")
async def delete_block(section: str, block_id: str):
    """Delete a block"""
    if "blocks" not in cms_data:
        raise HTTPException(status_code=404, detail="Blocks not found")
    cms_data["blocks"] = [b for b in cms_data["blocks"] if b.get("id") != block_id]
    return {"success": True, "deleted": block_id}

@router.get("/tags")
async def get_tags():
    """Get all tags"""
    return cms_data.get("tags", [])

@router.post("/tags")
async def add_tag(tag: Dict[Any, Any]):
    """Add a new tag"""
    if "tags" not in cms_data:
        cms_data["tags"] = []
    tag["id"] = tag.get("id", tag.get("name", "").lower().replace(" ", "-"))
    cms_data["tags"].append(tag)
    return {"success": True, "tag": tag}

@router.delete("/tags/{tag_id}")
async def delete_tag(tag_id: str):
    """Delete a tag"""
    if "tags" in cms_data:
        cms_data["tags"] = [t for t in cms_data["tags"] if t.get("id") != tag_id]
    return {"success": True, "deleted": tag_id}

@router.get("/theme")
async def get_theme():
    """Get theme settings"""
    return cms_data.get("theme", {})

@router.put("/theme")
async def update_theme(theme: Dict[Any, Any]):
    """Update theme"""
    cms_data["theme"] = theme
    return {"success": True, "updated_at": datetime.utcnow().isoformat()}

@router.get("/settings")
async def get_settings():
    """Get site settings"""
    return cms_data.get("settings", {})

@router.put("/settings")
async def update_settings(settings: Dict[Any, Any]):
    """Update site settings"""
    cms_data["settings"] = settings
    return {"success": True, "updated_at": datetime.utcnow().isoformat()}

@router.get("/navigation")
async def get_navigation():
    """Get navigation menu"""
    return cms_data.get("navigation", {})

@router.put("/navigation")
async def update_navigation(nav: Dict[Any, Any]):
    """Update navigation"""
    cms_data["navigation"] = nav
    return {"success": True, "updated_at": datetime.utcnow().isoformat()}

@router.post("/sync/guesty")
async def sync_from_guesty():
    """Sync data from Guesty (placeholder - would integrate with Guesty API)"""
    # This would pull data from Guesty and populate CMS
    return {
        "success": True,
        "message": "Sync completed",
        "synced_at": datetime.utcnow().isoformat(),
        "items": {"properties": 21, "reviews": 50, "media": 100}
    }

@router.post("/generate/ai")
async def generate_ai_content(prompt: str, content_type: str = "description"):
    """Generate AI content using Gemini (placeholder)"""
    # This would integrate with Gemini API
    return {
        "success": True,
        "generated": {
            "type": content_type,
            "prompt": prompt,
            "content": f"AI-generated {content_type} for: {prompt}",
            "generated_at": datetime.utcnow().isoformat()
        }
    }

print("CMS Routes loaded: /api/cms/*")
