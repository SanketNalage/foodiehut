# FoodieHut — Student Food Canteen Management System

FoodieHut is a modern, production-grade full-stack food ordering and canteen management system built for educational and institutional campuses. It enables queue-less food ordering through QR code scanning, single-use OTP authentication, real-time order tracking via WebSockets, and seamless kitchen dispatch workflows.

---

## 🌟 Highlights & Key Features

- **Windows-First Architecture**: Native PowerShell automation scripts, Windows path support, and multi-mode deployments.
- **Role-Based Access Control (RBAC)**: Distinct, isolated workflows for `ROLE_STUDENT` and `ROLE_CANTEEN_OWNER`.
- **OTP-Based Authentication**: Secure passwordless authentication with expiration, resend cooldown, attempt limiting, and dev mock support.
- **Dynamic QR Code Generation & Scanning**:
  - Unique Canteen Code (e.g., `CAN-8F42K9`) with Download & Print QR buttons.
  - Unique Student Code (e.g., `STU-7K29PX`) with Student ID Card QR.
  - In-browser HTML5 camera QR scanner with instant manual code fallback.
- **Server-Side Price Recalculation**: Order totals are strictly calculated from database snapshots, eliminating client price manipulation.
- **Historical Price Protection**: Historical orders preserve their snapshot unit price, even if food prices change later in the canteen menu.
- **Real-Time Kitchen Updates**: Live bi-directional updates between students and canteens powered by Spring WebSockets & STOMP topics without manual page reloads.
- **Container & Cloud-Native Ready**: Docker multi-stage builds, Docker Compose with MySQL 8, and Kubernetes manifests for KIND.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17/21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, WebSocket/STOMP, ZXing QR, JJWT |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, html5-qrcode, qrcode.react, @stomp/stompjs |
| **Database** | MySQL 8.0 (Production / Docker / KIND), H2 In-Memory (Automated test suite) |
| **DevOps & Cloud** | Docker Desktop, Docker Compose, KIND (Kubernetes in Docker), kubectl, Nginx Alpine |
| **API Docs** | OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`) |

---

## 📁 Project Structure

```
foodiehut/
├── backend/                        # Spring Boot 3 Java Backend
│   ├── src/main/java/com/foodiehut/
│   │   ├── config/                 # OpenAPI & App configurations
│   │   ├── controller/             # REST API Controllers (Auth, Student, Canteen, Food, Order)
│   │   ├── dto/                    # Request/Response Data Transfer Objects
│   │   ├── entity/                 # JPA Entities (User, Student, Canteen, FoodItem, Order, etc.)
│   │   ├── exception/              # Global Exception Handling & Error Responses
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   ├── security/               # JWT Token Provider, Filters, UserDetails
│   │   ├── service/                # Business logic (Auth, OTP, Orders, Food, QR)
│   │   └── websocket/              # STOMP broker config, events & publisher
│   ├── src/main/resources/         # application.yml, application-test.yml
│   ├── src/test/java/              # Automated unit, authorization & integration tests
│   ├── pom.xml                     # Maven build configuration
│   └── Dockerfile                  # Multi-stage JDK 17/21 runtime container
├── frontend/                       # React 18 TypeScript Frontend
│   ├── src/
│   │   ├── components/             # Navbar, OrderTimeline, QrScannerModal, QrCodeModal
│   │   ├── context/                # AuthContext, CartContext
│   │   ├── hooks/                  # useWebSocket STOMP subscriber hook
│   │   ├── pages/                  # Landing, Login/Register, Dashboards, Menu, Cart, Orders, Profile
│   │   ├── api.ts                  # Typed Fetch/Axios API client
│   │   └── types.ts                # TypeScript interfaces
│   ├── nginx.conf                  # Production SPA Nginx configuration & API proxy
│   ├── Dockerfile                  # Multi-stage Node build -> Nginx Alpine container
│   ├── package.json                # Dependencies and scripts
│   └── vite.config.ts              # Vite config with dev proxy
├── k8s/                            # Kubernetes Manifests for KIND
│   ├── namespace.yaml              # foodiehut namespace
│   ├── kind-config.yaml            # Port mappings (Host 80 & 8080)
│   ├── mysql/                      # MySQL Secret, PVC, Deployment, Service
│   ├── backend/                    # Spring Boot ConfigMap, Secret, Deployment, Service
│   └── frontend/                   # Frontend Deployment, Service
├── scripts/                        # Automated Windows PowerShell Scripts
│   ├── setup-windows.ps1           # Prerequisite validation and portable tool installer
│   ├── start-local.ps1             # Local development startup
│   ├── start-kind.ps1              # Automated KIND build, load, deploy & verification
│   ├── stop-kind.ps1               # KIND cluster cleanup
│   └── test-e2e.ps1                # 11-step automated end-to-end API verification suite
├── bin/                            # Portable Windows binaries (kubectl.exe, kind.exe)
├── docker-compose.yml              # Local multi-container MySQL, Backend, Frontend
├── .env.example                    # Template environment variables
└── README.md                       # Comprehensive guide
```

---

## ⚡ Prerequisites Check & Automatic Setup

Before starting, run the automated Windows prerequisite checker:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-windows.ps1
```

The script verifies:
1. **Java 17/21+** (`java -version`)
2. **Maven 3.9+** (`mvn -version`)
3. **Node.js LTS & npm** (`node --version`, `npm --version`)
4. **Git for Windows** (`git --version`)
5. **kubectl** (Auto-downloaded into `bin\kubectl.exe` if not present in PATH)
6. **KIND** (Auto-downloaded into `bin\kind.exe` if not present in PATH)
7. **Docker Desktop** (Reports exact command `winget install Docker.DockerDesktop` if not installed)

---

## 🚀 Running FoodieHut Locally

### Option A: Local Development (Hot Reloading)

1. **Start Backend**:
   ```powershell
   cd s:\foodiehut\backend
   mvn spring-boot:run
   ```
   *Note: In development mode without an external MySQL daemon, activate the test profile by adding `--spring.profiles.active=test` to run against embedded MySQL-mode H2.*

2. **Start Frontend**:
   ```powershell
   cd s:\foodiehut\frontend
   npm run dev
   ```

3. **Access Applications**:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **OpenAPI Schema**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### Option B: Docker Compose (MySQL 8 + Backend + Frontend)

Ensure Docker Desktop is running, then execute:

```powershell
docker compose up --build -d
```

Compose containers:
- `foodiehut-mysql`: MySQL 8.0 with persistent storage on port `3306`
- `foodiehut-backend`: Spring Boot REST API on port `8080`
- `foodiehut-frontend`: Nginx serving React SPA on ports `80` and `5173`

To stop:
```powershell
docker compose down -v
```

---

### Option C: KIND Kubernetes Deployment

Deploy the entire stack onto a local KIND (Kubernetes in Docker) cluster:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-kind.ps1
```

This single command:
1. Verifies Docker Engine.
2. Creates the cluster `foodiehut-cluster` using `k8s\kind-config.yaml` with host port mappings.
3. Builds Docker images `foodiehut-backend:1.0.0` and `foodiehut-frontend:1.0.0`.
4. Loads both images directly into the KIND control-plane node.
5. Deploys MySQL (Secret, PVC, Deployment, Service), Backend, and Frontend.
6. Waits for all readiness probes to succeed.
7. Displays live pod statuses and URLs.

To delete the cluster:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\stop-kind.ps1
```

---

## 🧪 Testing & Verification

### 1. Automated Java Backend Tests
Run the comprehensive JUnit 5 test suite:
```powershell
cd s:\foodiehut\backend
mvn clean test
```

Tests verify:
1. **Student cannot access another student's order** (`SecurityAndAuthorizationTest`)
2. **Canteen owner cannot access another canteen's orders/foods** (`SecurityAndAuthorizationTest`)
3. **Student cannot order unavailable food** (`OrderServiceTest`)
4. **Frontend cannot manipulate final price (DB price enforcement)** (`OrderServiceTest`)
5. **Invalid OTP is rejected** (`OtpServiceTest`)
6. **Expired OTP is rejected** (`OtpServiceTest`)
7. **OTP cannot be reused** (`OtpServiceTest`)
8. **Historical price integrity is preserved after price updates** (`OrderServiceTest`)
9. **Invalid order status transitions are rejected** (`OrderServiceTest`)

### 2. End-to-End API Integration Verification
Run the 11-step integration test against the running application:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\test-e2e.ps1 -BaseUrl "http://localhost:8080"
```
*(Or test via the frontend proxy: `-BaseUrl "http://localhost:5173"`)*

---

## 📱 User Workflows

### 🏪 Canteen Owner Workflow
1. Navigate to **Canteen Portal** -> **Register Canteen**.
2. Fill owner name, canteen name, email, phone, and address.
3. Enter 6-digit OTP (Dev mode: `123456`).
4. System automatically assigns a unique **Canteen Code** (e.g. `CAN-8F42K9`) and generates a **Counter QR Code**.
5. Click **Canteen QR** to download or print the counter QR.
6. Go to **Food Menu** -> Click **Add Food Item** (name, category, price, veg/non-veg, prep time).
7. Toggle availability switch anytime to make dishes unavailable in real-time.
8. As students place orders, new orders chime into the **Live Orders** dashboard in real-time.
9. Click **Accept** -> **Start Preparing** -> **Mark Ready** -> **Mark Completed**.

### 🎓 Student Workflow
1. Navigate to **Student Login** or **Register**.
2. Enter student details, institution, roll number, and section.
3. Enter 6-digit OTP to log in and receive an instant **Student Code** (e.g. `STU-7K29PX`) and **Student QR**.
4. Click **Scan Canteen QR** from the navbar or dashboard (or type the Canteen Code manually).
5. View the canteen's live menu with category filters and veg/non-veg toggles.
6. Unavailable food clearly displays **Currently Unavailable** and cannot be added.
7. Add items to cart, review quantities and subtotal, and confirm order.
8. Watch the **Real-Time Order Timeline** transition automatically (`PLACED` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `COMPLETED`) via WebSocket subscriptions without manual refreshing.

---

## 🔒 Security Architecture

- **Stateless JWT**: Bearer tokens with HMAC-SHA256 signatures (`jjwt-api 0.12.5`).
- **Authorization Enforcement**: Derived solely from the authenticated user's token identity; user cannot impersonate another student or access another canteen's orders.
- **SQL Injection Prevention**: Parameterized queries via Spring Data JPA and Hibernate.
- **Single-Use Hashed OTPs**: BCrypt hashing with configurable expiration (300s), resend cooldown (30s), and attempt thresholds (5 max).
- **CORS Configuration**: Configurable origins supporting localhost, Docker Compose, and KIND ports.
