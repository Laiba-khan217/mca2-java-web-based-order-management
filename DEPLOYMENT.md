# Deployment Guide

The whole system (MySQL + Spring Boot API + React site) runs with one command using Docker.

## Option A: Any Linux server / VPS (recommended)

Works on a DigitalOcean / Hetzner / AWS Lightsail / Azure VM, or any machine with Docker installed. A server with 2 GB RAM is enough.

1. Install Docker and the Compose plugin: https://docs.docker.com/engine/install/
2. Get the code on the server:
   ```bash
   git clone https://github.com/Laiba-khan217/mca2-java-web-based-order-management.git
   cd mca2-java-web-based-order-management
   ```
3. Create your settings file:
   ```bash
   cp .env.example .env
   nano .env        # set DB_PASSWORD and JWT_SECRET (openssl rand -hex 32 makes a good secret)
   ```
4. Build and start everything:
   ```bash
   docker compose up -d --build
   ```
5. Open `http://<your-server-ip>/` and log in with the demo accounts from the README.

First start takes a few minutes (it builds both images and MySQL loads `database/schema.sql` and `database/seed_data.sql`).

Useful commands:

```bash
docker compose logs -f backend     # watch the API logs
docker compose ps                  # check all 3 services are up
docker compose down                # stop (data is kept in the db_data volume)
docker compose down -v             # stop AND wipe the database
```

To test on your own PC first, set `HTTP_PORT=8081` in `.env` and open http://localhost:8081.

### HTTPS and a domain
Point your domain's A record at the server, then put a reverse proxy such as Caddy in front (it gets free certificates automatically). Minimal `Caddyfile`:

```
yourdomain.com {
    reverse_proxy localhost:8081
}
```

(set `HTTP_PORT=8081` so Caddy can own ports 80/443).

## Option B: Separate managed services (Render / Railway / etc.)

- **Database:** create a managed MySQL 8 instance and run `database/schema.sql` then `database/seed_data.sql` against it (the backend uses `ddl-auto=validate`, so the tables must exist first).
- **Backend:** deploy the `backend/` folder using its Dockerfile. Set the environment variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`. The platform's `PORT` is picked up automatically.
- **Frontend:** deploy the `frontend/` folder using its Dockerfile and set `BACKEND_URL` to the backend's public URL (for example `https://oms-api.onrender.com`). nginx forwards `/api` calls there, so no CORS setup is needed.

## Configuration reference

| Variable | Used by | Purpose | Default (local dev) |
| :--- | :--- | :--- | :--- |
| `DB_URL` | backend | JDBC URL | `jdbc:mysql://localhost:3306/oms_db?...` |
| `DB_USERNAME` | backend | DB user | `root` |
| `DB_PASSWORD` | backend / compose | DB password | `Password@20` |
| `JWT_SECRET` | backend | Signs login tokens (32+ chars) | the old value in `application.properties` |
| `CORS_ALLOWED_ORIGINS` | backend | Only needed if the site calls the API from another domain | `http://localhost:5173,...` |
| `BACKEND_URL` | frontend | Where nginx forwards `/api` | `http://backend:8080` |
| `HTTP_PORT` | compose | Published port | `80` |

## Before going public

- Change `JWT_SECRET` and `DB_PASSWORD` (the defaults are in the public repo, so anyone can read them).
- Change the passwords of the demo accounts (`admin`, `ordermanager`, `procurement`) from the Users page, or remove the demo accounts you do not need.
- `spring.jpa.show-sql=true` and DEBUG logging are noisy in production; you can turn them off in `application.properties`.
