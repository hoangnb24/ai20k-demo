# AWS VPS CI/CD Deployment Guide

This guide deploys `ai20k-demo` to a single AWS VPS with Docker Compose, Traefik, Let’s Encrypt SSL, PostgreSQL, Grafana, Prometheus, Loki, Alloy, node-exporter, and cAdvisor.

Use this path for the demo because it matches the production Compose stack in this repo.

## 0. Values to prepare

Replace these placeholders throughout the guide:

```bash
DOMAIN=yourdomain.com
VPS_IP=your.vps.public.ip
VPS_USER=ubuntu
STACK_PATH=/opt/ai20k-demo
ACME_EMAIL=you@example.com
```

Required public routes:

- `https://app.${DOMAIN}` -> Next.js app
- `https://slides.${DOMAIN}` -> presentation
- `https://grafana.${DOMAIN}` -> Grafana

Optional route:

- `https://portainer.${DOMAIN}` -> Portainer Docker admin UI, only if the `admin` profile is enabled

## 1. DNS setup

Create these DNS records:

| Type | Name | Content | Proxy status |
| --- | --- | --- | --- |
| A | `app` | `VPS_IP` | DNS only |
| A | `slides` | `VPS_IP` | DNS only |
| A | `grafana` | `VPS_IP` | DNS only |

If you want optional Portainer, also create:

| Type | Name | Content | Proxy status |
| --- | --- | --- | --- |
| A | `portainer` | `VPS_IP` | DNS only |

For the first SSL issuance, keep records **DNS only**. If using Cloudflare, this means the gray cloud.

Traefik uses Let’s Encrypt HTTP-01. Let’s Encrypt must be able to reach:

```text
http://app.${DOMAIN}/.well-known/acme-challenge/...
http://slides.${DOMAIN}/.well-known/acme-challenge/...
http://grafana.${DOMAIN}/.well-known/acme-challenge/...
```

Verify DNS before starting Traefik:

```bash
dig +short app.${DOMAIN}
dig +short slides.${DOMAIN}
dig +short grafana.${DOMAIN}
```

Both commands must return `VPS_IP`. If they do not, stop here and fix DNS first.

## 2. Prepare the AWS VPS

SSH into the instance:

```bash
ssh ${VPS_USER}@${VPS_IP}
```

Install Docker on Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git openssl dnsutils jq

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
docker version --format 'client={{.Client.Version}} server={{.Server.Version}} clientAPI={{.Client.APIVersion}} serverAPI={{.Server.APIVersion}}'
```

Open firewall ports on the VPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Also confirm the AWS Lightsail firewall or EC2 security group allows:

- TCP `22` from your IP
- TCP `80` from `0.0.0.0/0` and `::/0`
- TCP `443` from `0.0.0.0/0` and `::/0`

## 3. Put the stack on the VPS

Clone the repo:

```bash
sudo mkdir -p /opt
sudo chown -R "$USER":"$USER" /opt

git clone https://github.com/hoangnb24/ai20k-demo.git ${STACK_PATH}
cd ${STACK_PATH}
```

If the repo is already cloned:

```bash
cd ${STACK_PATH}
git fetch origin
git checkout master
git pull --ff-only
```

## 4. Create `.env.prod`

Create the production env file:

```bash
cd ${STACK_PATH}
cp .env.prod.example .env.prod
openssl rand -base64 36
openssl rand -base64 36
nano .env.prod
```

Use this shape:

```bash
DOMAIN=yourdomain.com
ACME_EMAIL=you@example.com

WEB_IMAGE=ghcr.io/hoangnb24/ai20k-demo/web:master

NODE_ENV=production
CORS_ORIGIN=https://app.yourdomain.com
DATABASE_URL=postgresql://ai20k_demo:REPLACE_WITH_STRONG_PASSWORD@postgres:5432/ai20k_demo

POSTGRES_DB=ai20k_demo
POSTGRES_USER=ai20k_demo
POSTGRES_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Rules:

- `DOMAIN` must be the root domain only, for example `example.com`, not `app.example.com`.
- `CORS_ORIGIN` must be `https://app.${DOMAIN}`.
- `DATABASE_URL` password must exactly match `POSTGRES_PASSWORD`.
- `ACME_EMAIL` must be a real email address for Let’s Encrypt registration.
- Do not commit `.env.prod`.

Validate the Compose file can render:

```bash
docker compose --env-file .env.prod -f compose.prod.yml config >/tmp/ai20k-compose.yml
```

## 5. Make sure the web image exists

Primary path: GitHub Actions builds and pushes:

```text
ghcr.io/hoangnb24/ai20k-demo/web:master
```

If the GHCR package is private, login on the VPS:

```bash
echo "YOUR_GITHUB_PAT_WITH_READ_PACKAGES" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Test image pull:

```bash
docker compose --env-file .env.prod -f compose.prod.yml pull web
```

If the image has not been published yet, build locally on the VPS:

```bash
docker build -t ai20k-demo-web:local .
```

Then update `.env.prod`:

```bash
WEB_IMAGE=ai20k-demo-web:local
```

Skip `pull web` when using a local image.

## 6. Start the stack

For GHCR image:

```bash
docker compose --env-file .env.prod -f compose.prod.yml pull web traefik
docker compose --env-file .env.prod -f compose.prod.yml up -d --build --remove-orphans
```

For local image:

```bash
docker compose --env-file .env.prod -f compose.prod.yml pull traefik
docker compose --env-file .env.prod -f compose.prod.yml up -d --build --remove-orphans
```

Check status:

```bash
docker compose --env-file .env.prod -f compose.prod.yml ps
```

Watch the important logs:

```bash
docker compose --env-file .env.prod -f compose.prod.yml logs -f traefik web postgres
```

The `--build` flag builds the local `presentation` service.

## 7. SSL verification checklist

Run this checklist before debugging the app.

### 7.1 Confirm DNS points to this VPS

Run from your local machine or the VPS:

```bash
dig +short app.${DOMAIN}
dig +short slides.${DOMAIN}
dig +short grafana.${DOMAIN}
```

Expected: both return `VPS_IP`.

### 7.2 Confirm ports 80 and 443 are reachable

Run from your local machine:

```bash
curl -I http://app.${DOMAIN}
curl -Ik https://app.${DOMAIN}
curl -I http://slides.${DOMAIN}
curl -Ik https://slides.${DOMAIN}
curl -I http://grafana.${DOMAIN}
curl -Ik https://grafana.${DOMAIN}
```

Expected:

- HTTP should respond with a redirect to HTTPS, or Traefik should answer.
- HTTPS should not time out.

If these commands time out, check AWS firewall/security group and `ufw`.

### 7.3 Confirm Traefik is seeing Docker labels

```bash
docker compose --env-file .env.prod -f compose.prod.yml logs --tail=200 traefik
```

There must be no Docker API error like:

```text
client version 1.24 is too old
```

If that error appears, make sure the stack uses `traefik:v3.6.1` or newer:

```bash
grep 'image: traefik' compose.prod.yml
docker compose --env-file .env.prod -f compose.prod.yml pull traefik
docker compose --env-file .env.prod -f compose.prod.yml up -d traefik
```

### 7.4 Check ACME certificate storage

Traefik stores Let’s Encrypt data in the `traefik_letsencrypt` Docker volume.

Inspect it:

```bash
docker run --rm -v ai20k-demo_traefik_letsencrypt:/letsencrypt alpine ls -la /letsencrypt
docker run --rm -v ai20k-demo_traefik_letsencrypt:/letsencrypt alpine cat /letsencrypt/acme.json
```

If `acme.json` is missing or empty, Traefik has not issued certificates yet.

Check the Traefik logs for ACME errors:

```bash
docker compose --env-file .env.prod -f compose.prod.yml logs traefik | grep -Ei 'acme|certificate|challenge|letsencrypt|error'
```

### 7.5 Common SSL failure causes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Browser shows Traefik default/self-signed cert | Let’s Encrypt has not issued yet | Check Traefik ACME logs and DNS/ports |
| `timeout during connect` in ACME logs | Port 80 blocked | Open AWS firewall/security group and `ufw` port 80 |
| `unauthorized` in ACME logs | DNS points to wrong IP or proxy intercepts challenge | Fix A records; set Cloudflare to DNS-only |
| `too many certificates` or rate limit | Repeated failed issuance attempts | Wait for Let’s Encrypt rate limit window or use staging temporarily |
| HTTP works but HTTPS 404s | Traefik can run but did not discover service labels | Check Docker provider logs and `traefik:v3.6.1` |
| One hostname works but another does not | Missing DNS record or router not discovered | Check `dig`, labels, and Traefik logs |

### 7.6 Reset certificates after fixing DNS

Only do this after DNS and firewall are correct.

```bash
docker compose --env-file .env.prod -f compose.prod.yml down
docker volume rm ai20k-demo_traefik_letsencrypt
docker compose --env-file .env.prod -f compose.prod.yml up -d --build --remove-orphans
docker compose --env-file .env.prod -f compose.prod.yml logs -f traefik
```

This forces Traefik to request fresh certificates.

## 8. Validate in browser

Open:

```text
https://app.${DOMAIN}
https://slides.${DOMAIN}
https://grafana.${DOMAIN}
```

Validate:

- `https://app.${DOMAIN}` loads without browser SSL warnings.
- `https://slides.${DOMAIN}` loads without browser SSL warnings.
- `https://grafana.${DOMAIN}` loads without browser SSL warnings.
- Grafana login uses `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD`.
- Grafana data sources include Prometheus and Loki.
- In Grafana Explore, choose Loki and try:

```text
{stack="ai20k-demo"}
```

Also test from the VPS:

```bash
curl -I https://app.${DOMAIN}
docker compose --env-file .env.prod -f compose.prod.yml ps
```

Optional Portainer:

```bash
docker compose --env-file .env.prod -f compose.prod.yml --profile admin up -d portainer
```

Then open:

```text
https://portainer.${DOMAIN}
```

## 9. Wire GitHub Actions deploy

In GitHub:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Add:

```text
VPS_HOST=your.vps.public.ip
VPS_USER=your_ssh_user
VPS_SSH_KEY=private SSH key that can access the VPS
VPS_STACK_PATH=/opt/ai20k-demo
```

Optional:

```text
VPS_PORT=22
GHCR_USERNAME=your_github_username
GHCR_TOKEN=PAT with read:packages
```

Then push to `master`. The workflow should:

1. Build the web image.
2. Push it to GHCR.
3. SSH into the VPS.
4. Pull the latest repo checkout on the VPS so Compose and Traefik config changes are deployed.
5. Run `docker compose pull web traefik`.
6. Run `docker compose up -d --build --remove-orphans`.

## 10. Cloudflare note

Keep the DNS records as **DNS only** until SSL works.

After everything works, you can experiment with Cloudflare proxy, but set Cloudflare SSL/TLS mode to **Full (strict)**.

If certificate issuance starts failing after enabling the proxy:

1. Switch the records back to DNS-only, or
2. Change Traefik from HTTP-01 to Cloudflare DNS-01 challenge.

## References

- https://developers.cloudflare.com/dns/proxy-status/
- https://docs.docker.com/engine/install/ubuntu/
- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- https://doc.traefik.io/traefik/https/acme/
- https://doc.traefik.io/traefik/user-guides/docker-compose/acme-http/
- https://letsencrypt.org/docs/challenge-types/