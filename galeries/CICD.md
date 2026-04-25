0. What You Need
  Prepare these values:

  DOMAIN=yourdomain.com
  VPS_IP=your.vps.public.ip
  VPS_USER=your_ssh_user
  STACK_PATH=/opt/ai20k-demo

  Use app.yourdomain.com, grafana.yourdomain.com, and portainer.yourdomain.com.

  1. Cloudflare DNS
  In Cloudflare dashboard:

  Go to your domain -> DNS -> Records -> Add record.

  Create these records:

  Type: A
  Name: app
  Content: VPS_IP
  Proxy status: DNS only
  TTL: Auto

  Type: A
  Name: grafana
  Content: VPS_IP
  Proxy status: DNS only
  TTL: Auto

  Type: A
  Name: portainer
  Content: VPS_IP
  Proxy status: DNS only
  TTL: Auto

  Important: use DNS only, gray cloud, for first deploy. Our Traefik stack uses Let’s Encrypt HTTP-01, so port 80 must reach the VPS directly.

  Verify from your machine:

  dig +short app.yourdomain.com
  dig +short grafana.yourdomain.com
  dig +short portainer.yourdomain.com

  Each should return your VPS IP.

  2. Prepare The VPS
  SSH into the instance:

  ssh your_ssh_user@your.vps.public.ip

  Install Docker on Ubuntu:

  sudo apt-get update
  sudo apt-get install -y ca-certificates curl git

  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  Allow your user to run Docker:

  sudo usermod -aG docker "$USER"
  newgrp docker

  Verify:

  docker --version
  docker compose version

  Open firewall ports:

  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  sudo ufw status

  3. Put The Stack On The VPS
  Clone the repo into the stack path:

  sudo mkdir -p /opt
  sudo chown -R "$USER":"$USER" /opt

  cd /opt
  git clone https://github.com/hoangnb24/ai20k-demo.git
  cd ai20k-demo

  If the repo is private, clone with your normal GitHub auth method.

  4. Create .env.prod

  cp .env.prod.example .env.prod
  nano .env.prod

  Use values like this:

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

  Generate strong passwords:

  openssl rand -base64 36

  Make sure DATABASE_URL password and POSTGRES_PASSWORD match.

  5. Make Sure The Image Exists
  The primary path is GitHub Actions builds and pushes:

  ghcr.io/hoangnb24/ai20k-demo/web:master

  If the GHCR package is private, login on the VPS:

  echo "YOUR_GITHUB_PAT_WITH_READ_PACKAGES" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

  Then test pull:

  docker compose --env-file .env.prod -f compose.prod.yml pull web

  If this fails because the image has not been published yet, trigger the GitHub Action first by pushing to master, or manually build on the VPS for a first test:

  docker build -t ai20k-demo-web:local .

  Then set:

  WEB_IMAGE=ai20k-demo-web:local

  And skip pull web.

  6. Start The Stack
  For GHCR image:

  docker compose --env-file .env.prod -f compose.prod.yml pull web
  docker compose --env-file .env.prod -f compose.prod.yml up -d --remove-orphans

  For local image:

  docker compose --env-file .env.prod -f compose.prod.yml up -d --remove-orphans

  Check status:

  docker compose --env-file .env.prod -f compose.prod.yml ps

  Watch logs:

  docker compose --env-file .env.prod -f compose.prod.yml logs -f traefik web postgres

  7. Validate In Browser
  Open:

  https://app.yourdomain.com
  https://grafana.yourdomain.com
  https://portainer.yourdomain.com

  Grafana login is from .env.prod:

  GRAFANA_ADMIN_USER
  GRAFANA_ADMIN_PASSWORD

  Portainer will ask you to create its first admin user.

  Also test from the VPS:

  curl -I https://app.yourdomain.com
  docker compose --env-file .env.prod -f compose.prod.yml ps

  For Grafana observability:

  - Go to https://grafana.yourdomain.com
  - Check Connections / Data sources
  - Prometheus and Loki should already exist
  - In Explore, choose Loki and try:

  {stack="ai20k-demo"}

  8. Wire GitHub Actions Deploy
  In GitHub repo:

  Settings -> Secrets and variables -> Actions -> New repository secret

  Add:

  VPS_HOST=your.vps.public.ip
  VPS_USER=your_ssh_user
  VPS_SSH_KEY=private SSH key that can access the VPS
  VPS_STACK_PATH=/opt/ai20k-demo

  Optional:

  VPS_PORT=22
  GHCR_USERNAME=your_github_username
  GHCR_TOKEN=PAT with read:packages

  Then push to master. The workflow should:

  1. Build image.
  2. Push to GHCR.
  3. SSH into VPS.
  4. Run docker compose pull web.
  5. Run docker compose up -d --remove-orphans.

  Important Cloudflare Note
  Keep the three DNS records as DNS only for now. After everything works, you can experiment with Cloudflare proxy, but then set Cloudflare SSL/TLS mode to Full
  (strict). If cert issuance starts failing, switch back to DNS-only or change Traefik later to Cloudflare DNS challenge.

  References: Cloudflare DNS proxy status docs, Docker Ubuntu install docs, GitHub Container Registry auth docs, and Traefik HTTP-01 docs:

  - https://developers.cloudflare.com/dns/proxy-status/
  - https://docs.docker.com/engine/install/ubuntu/
  - https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
  - https://doc.traefik.io/traefik/https/acme/