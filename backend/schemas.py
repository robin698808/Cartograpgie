from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from models import UserRole, ProjectVisibility, MemberRole


# ─── Auth ───────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    nom: str
    password: str

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None

class UserOut(BaseModel):
    id: int
    email: str
    nom: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Project ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    nom: str
    description: Optional[str] = ""
    visibility: Optional[ProjectVisibility] = ProjectVisibility.private

class ProjectUpdate(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[ProjectVisibility] = None

class ProjectOut(BaseModel):
    id: int
    nom: str
    description: str
    visibility: ProjectVisibility
    owner_id: int
    owner: UserOut
    created_at: datetime
    updated_at: datetime
    member_count: Optional[int] = 0
    snapshot_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ─── Member ──────────────────────────────────────────────────────────────────

class MemberInvite(BaseModel):
    email: EmailStr
    role: MemberRole = MemberRole.editor

class MemberOut(BaseModel):
    id: int
    user: UserOut
    role: MemberRole
    joined_at: datetime

    class Config:
        from_attributes = True


# ─── Snapshot ────────────────────────────────────────────────────────────────

class SnapshotCreate(BaseModel):
    apps: Any             # list of app objects from the canvas
    flows: Any            # list of flow objects
    dom_colors: Any       # dict of domain colors
    label: Optional[str] = ""

class SnapshotOut(BaseModel):
    id: int
    project_id: int
    apps: Any
    flows: Any
    dom_colors: Any
    label: str
    created_by: Optional[int] = None
    created_by_user: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── WebSocket messages ───────────────────────────────────────────────────────

class WSMessage(BaseModel):
    type: str           # "apps_update" | "flows_update" | "user_joined" | "user_left" | "cursor_move"
    payload: Any
    user_id: Optional[int] = None
    user_nom: Optional[str] = None
