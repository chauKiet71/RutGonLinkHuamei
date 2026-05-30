# Hướng Dẫn Cài Đặt Docker & Docker Compose

Hướng dẫn này sẽ giúp bạn cài đặt Docker trên Windows, Mac, hoặc Linux.

## 🪟 **Windows**

### Phương pháp 1: Docker Desktop (Khuyên dùng)

**Bước 1: Tải xuống**
- Vào [Docker Desktop cho Windows](https://www.docker.com/products/docker-desktop)
- Click nút **Download for Windows**
- Chọn phiên bản theo CPU của bạn:
  - **Intel/AMD**: `Docker Desktop Installer.exe`
  - **Apple Silicon**: `Docker Desktop for Mac`

**Bước 2: Cài đặt**
- Chạy file `DockerDesktopInstaller.exe`
- Chấp nhận các điều khoản
- Chọn:
  - ✅ WSL 2 (Windows Subsystem for Linux 2)
  - ✅ Hyper-V
- Nhấp **Install**
- Đợi khoảng 5-10 phút

**Bước 3: Khởi động**
- Khởi động lại máy khi được yêu cầu
- Mở **Docker Desktop** từ Start Menu
- Chờ Docker icon ổn định ở system tray

**Bước 4: Kiểm tra**
Mở PowerShell và chạy:
```powershell
docker --version
docker-compose --version
```

### Phương pháp 2: WSL 2 + Docker CLI (Advanced)

```powershell
# 1. Cài WSL 2
wsl --install

# 2. Cài Docker
choco install docker
choco install docker-compose

# 3. Khởi động Docker daemon
```

---

## 🍎 **Mac**

### Phương pháp 1: Docker Desktop (Khuyên dùng)

**Bước 1: Tải xuống**
- Vào [Docker Desktop cho Mac](https://www.docker.com/products/docker-desktop)
- Chọn chip của Mac:
  - **Apple Silicon (M1/M2/M3)**: `Docker.dmg` - Apple Silicon
  - **Intel**: `Docker.dmg` - Intel Chip

**Bước 2: Cài đặt**
- Nhấp đúp vào `Docker.dmg`
- Kéo Docker icon vào **Applications** folder
- Mở **Applications** → **Docker**
- Nhập mật khẩu khi được yêu cầu

**Bước 3: Kiểm tra**
```bash
docker --version
docker-compose --version
```

### Phương pháp 2: Homebrew

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài Docker
brew install docker docker-compose

# Hoặc cài Docker Desktop
brew install --cask docker
```

---

## 🐧 **Linux (Ubuntu/Debian)**

### Cách nhanh nhất

```bash
# 1. Cập nhật packages
sudo apt update
sudo apt upgrade

# 2. Cài Docker
sudo apt install docker.io docker-compose

# 3. Thêm user vào docker group (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker

# 4. Kiểm tra
docker --version
docker-compose --version

# 5. Bắt đầu service
sudo systemctl start docker
sudo systemctl enable docker
```

### Cách chính thức (từ Docker)

```bash
# 1. Gỡ Docker cũ nếu có
sudo apt remove docker docker-engine docker.io containerd runc

# 2. Setup repository
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 4. Setup repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cài Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Kiểm tra
docker --version
docker compose version

# 7. Khởi động
sudo systemctl start docker
```

### Cho CentOS/RHEL/Fedora

```bash
# 1. Cài dependencies
sudo yum install -y yum-utils

# 2. Setup repository
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 3. Cài Docker
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. Khởi động
sudo systemctl start docker
sudo systemctl enable docker

# 5. Kiểm tra
docker --version
```

---

## ✅ **Kiểm Tra Cài Đặt**

Trên tất cả hệ điều hành, chạy:

```bash
# Kiểm tra Docker
docker run hello-world

# Nếu thấy "Hello from Docker!" - cài đặt thành công!
```

```bash
# Kiểm tra Docker Compose
docker-compose --version

# Kết quả: Docker Compose version v2.x.x
```

---

## 🚀 **Sử Dụng Ngay**

Sau khi cài xong, chạy project:

```bash
# Clone hoặc vào thư mục project
cd RutGonLinkHuamei

# Chạy
docker-compose up --build

# Mở http://localhost:3000
```

---

## ⚠️ **Xử Lý Sự Cố**

### Docker không khởi động được

**Windows:**
- Bật Hyper-V: Settings → Apps → Programs and Features → Turn Windows features on or off
- Chọn ✅ Hyper-V
- Khởi động lại

**Mac:**
- Mở Docker từ Applications
- Kiểm tra System Preferences → Docker

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl status docker
```

### Permission denied

**Linux:**
```bash
sudo usermod -aG docker $USER
newgrp docker

# Log out và log in lại
```

### Port 3000 đã được sử dụng

```bash
# Thay đổi port trong docker-compose.yml
# Từ: "3000:3000"
# Thành: "3001:3000"

docker-compose up --build
```

### Docker desktop yêu cầu WSL 2 (Windows)

```powershell
# Cài WSL 2
wsl --install

# Cài kernel update
wsl --update

# Khởi động lại
Restart-Computer
```

---

## 📱 **Gỡ Cài Đặt**

### Windows
- Settings → Apps → Docker Desktop → Uninstall

### Mac
- Applications → Kéo Docker vào Trash
- Cmd + Shift + Delete (Empty Trash)

### Linux
```bash
sudo apt remove docker docker-compose
sudo apt autoremove
```

---

## 📚 **Tài Liệu Thêm**

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)
- [Play with Docker](https://www.play-with-docker.com/) (thử online)

**Xong! Giờ bạn đã sẵn sàng để chạy project với Docker 🐳**
