# Cartographe — Backend FastAPI

## Démarrage rapide (sans Docker)

### Prérequis
- Python 3.11+
- PowerShell ou terminal

### Installation

```powershell
# Cloner / se placer dans le dossier backend
cd cartographe/backend

# Créer un environnement virtuel
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate   # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn main:app --reload --port 8000
```

L'API est accessible sur http://localhost:8000  
La doc Swagger : http://localhost:8000/docs

---

## Démarrage avec Docker

```powershell
cd cartographe
docker-compose up --build
```

---

## Endpoints principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/register | Créer un compte |
| POST | /api/auth/login | Login → JWT |
| GET | /api/auth/me | Profil courant |
| GET | /api/projects | Mes projets |
| POST | /api/projects | Créer un projet |
| GET | /api/projects/{id}/snapshots/latest | Dernier état du canvas |
| POST | /api/projects/{id}/snapshots | Sauvegarder le canvas |
| WS | /ws/{project_id}?token=... | Collaboration temps réel |

---

## Variables d'environnement (.env)

```env
DATABASE_URL=sqlite:///./cartographe.db
SECRET_KEY=change-me-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

## Migration vers PostgreSQL

1. Décommenter le service `db` dans `docker-compose.yml`
2. Changer `DATABASE_URL` :
```env
DATABASE_URL=postgresql://cartographe:secret@db:5432/cartographe
```
3. Ajouter `psycopg2-binary` dans `requirements.txt`
4. `docker-compose up --build`

---

## Prochaines étapes (Phase 3)

- [ ] Frontend React séparé (Vite)
- [ ] Page Login/Register
- [ ] Liste des projets
- [ ] Barre de présence WebSocket dans le canvas
- [ ] Auto-save toutes les 30s
- [ ] Historique des snapshots dans la sidebar

---

## Déploiement en production

| Service | Plateforme | URL |
|---------|------------|-----|
| Frontend | Vercel | https://cartographie-47pf-lake.vercel.app/ |
| Backend | Railway | https://cartographie-production-76cc.up.railway.app |

### Variables d'environnement Railway

```env
DATABASE_URL=postgresql://...  # fourni par Railway
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://cartographie-47pf-lake.vercel.app
```
