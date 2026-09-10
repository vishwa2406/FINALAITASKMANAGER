# 🤖 AI Task Manager — MVC Architecture

Full-stack production app built with **Spring MVC + React MVC pattern**.

---

## 🏗️ MVC Architecture Explained

### What is MVC?
MVC separates an application into three interconnected layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│              React View components render UI                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                   CONTROLLER LAYER                           │
│  Backend: controller/*.java  ← routes HTTP → Service        │
│  Frontend: controller/hooks/* ← custom hooks with logic     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  (Backend only) Bridges Model ↔ View; business rules here   │
└──────────┬──────────────────────────────────────────────────┘
           │                          │
┌──────────▼──────────┐    ┌──────────▼──────────────────────┐
│   MODEL LAYER        │    │       VIEW LAYER                 │
│ Backend:             │    │  Backend: view/dto/request/*     │
│  model/entity/*.java │    │           view/dto/response/*    │
│  model/enums/*.java  │    │  Frontend: view/pages/*          │
│ Frontend:            │    │            view/components/*     │
│  model/taskModel.js  │    │                                  │
│  model/userModel.js  │    │                                  │
└─────────────────────┘    └──────────────────────────────────┘
```

---

## 📁 Full Project Structure

```
ai-task-manager-mvc/
│
├── backend/src/main/java/com/aitaskmanager/
│   │
│   ├── 📦 model/                      ← MODEL LAYER
│   │   ├── entity/
│   │   │   ├── User.java              ← users table (JPA Entity)
│   │   │   └── Task.java              ← tasks table (JPA Entity)
│   │   └── enums/
│   │       ├── Role.java              ← USER | ADMIN
│   │       ├── TaskStatus.java        ← TODO | IN_PROGRESS | COMPLETED | CANCELLED
│   │       └── TaskPriority.java      ← LOW | MEDIUM | HIGH | URGENT
│   │
│   ├── 📦 view/                       ← VIEW LAYER (JSON shapes)
│   │   └── dto/
│   │       ├── request/
│   │       │   ├── RegisterRequest.java
│   │       │   ├── LoginRequest.java
│   │       │   ├── TaskRequest.java
│   │       │   ├── TaskFilterRequest.java
│   │       │   └── TaskStatusUpdateRequest.java
│   │       └── response/
│   │           ├── ApiResponse.java   ← Standard response envelope
│   │           ├── AuthResponse.java
│   │           ├── UserProfileResponse.java
│   │           ├── TaskResponse.java
│   │           ├── PagedTaskResponse.java
│   │           └── DashboardStatsResponse.java
│   │
│   ├── 📦 controller/                 ← CONTROLLER LAYER
│   │   ├── AuthController.java        ← POST /api/auth/register,login GET /me
│   │   ├── TaskController.java        ← CRUD /api/tasks/*
│   │   └── AiController.java          ← /api/ai/*
│   │
│   ├── 📦 service/                    ← SERVICE (business logic bridge)
│   │   ├── AuthService.java
│   │   ├── TaskService.java
│   │   └── AiService.java
│   │
│   ├── 📦 repository/                 ← DATA ACCESS
│   │   ├── UserRepository.java
│   │   └── TaskRepository.java
│   │
│   ├── 📦 security/                   ← CROSS-CUTTING
│   │   ├── JwtService.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   │
│   ├── 📦 config/
│   │   └── SecurityConfig.java
│   │
│   └── 📦 exception/
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       └── ResourceAlreadyExistsException.java
│
└── frontend/src/
    │
    ├── 📦 model/                      ← MODEL LAYER
    │   ├── taskModel.js               ← Status/Priority enums, colors, routes
    │   └── userModel.js               ← User constants, password validation
    │
    ├── 📦 view/                       ← VIEW LAYER (presentation only)
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── TasksPage.jsx
    │   │   ├── TaskDetailPage.jsx
    │   │   ├── AiPage.jsx
    │   │   └── ProfilePage.jsx
    │   └── components/
    │       ├── layout/
    │       │   └── MainLayout.jsx
    │       ├── tasks/
    │       │   └── TaskFormModal.jsx
    │       └── common/
    │           ├── Badge.jsx
    │           └── Spinner.jsx
    │
    ├── 📦 controller/                 ← CONTROLLER LAYER
    │   ├── api.js                     ← Axios instance (shared infrastructure)
    │   ├── context/
    │   │   └── AuthContext.jsx        ← Global auth state controller
    │   └── hooks/
    │       ├── useAuthController.js   ← Login/register logic
    │       ├── useTaskController.js   ← Task list logic
    │       ├── useTaskDetailController.js
    │       ├── useTaskFormController.js
    │       ├── useDashboardController.js
    │       └── useAiController.js
    │
    ├── App.jsx                        ← Router + PrivateRoute
    ├── main.jsx                       ← React entry point
    └── index.css                      ← Tailwind + globals
```

---

## 🚀 Quick Start

### With Docker (easiest)
```bash
cd ai-task-manager-mvc
cp .env.example .env
# Edit .env: add your OPENAI_API_KEY
docker-compose up --build
# → http://localhost:3000
```

### Without Docker

**MySQL setup:**
```sql
CREATE DATABASE aitaskmanager;
CREATE USER 'aitaskuser'@'localhost' IDENTIFIED BY 'aitaskpassword';
GRANT ALL PRIVILEGES ON aitaskmanager.* TO 'aitaskuser'@'localhost';
```

**Backend:**
```bash
cd backend
# Edit src/main/resources/application.properties with your DB + OpenAI config
mvn clean install -DskipTests
mvn spring-boot:run
# → http://localhost:8080/api
```

**Frontend:**
```bash
cd frontend
# .env already has VITE_API_URL=http://localhost:8080/api
npm install
npm run dev
# → http://localhost:3000
```

---

## 🔑 API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login → JWT |
| GET | `/api/auth/me` | ✅ | Current user profile |
| GET | `/api/tasks` | ✅ | List tasks (filter/search/page) |
| GET | `/api/tasks/dashboard` | ✅ | Dashboard stats |
| GET | `/api/tasks/{id}` | ✅ | Single task |
| POST | `/api/tasks` | ✅ | Create task |
| PUT | `/api/tasks/{id}` | ✅ | Update task |
| PATCH | `/api/tasks/{id}/status` | ✅ | Update status |
| DELETE | `/api/tasks/{id}` | ✅ | Delete task |
| POST | `/api/ai/tasks/{id}/suggest` | ✅ | AI suggestion for task |
| GET | `/api/ai/productivity-analysis` | ✅ | AI analysis |
| GET | `/api/ai/task-suggestions` | ✅ | AI-suggested tasks |

---

## ☁️ Deployment

### Backend → Render.com
```
Root: backend
Build: mvn clean package -DskipTests
Start: java -jar target/*.jar
Env vars: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS
```

### Frontend → Vercel
```
Root: frontend
Framework: Vite
Env vars: VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 💼 MVC Interview Tips

**Q: Why separate Model, View, Controller?**
> Separation of concerns — each layer has one job. Model owns data rules, View owns presentation, Controller owns request routing. This makes code testable, maintainable, and scalable independently.

**Q: In a REST API, what is the "View"?**
> In traditional MVC the View is HTML. In REST APIs, the View is the JSON shape returned to clients — the DTO (Data Transfer Object). Spring still calls itself "Spring MVC" because the same Controller→Service→Model flow applies, just rendered as JSON.

**Q: Why use DTOs instead of returning entities directly?**
> Security (hides password hash), flexibility (API shape ≠ DB shape), versioning (can evolve DB without breaking API), and validation (input contract separate from storage contract).

**Q: What's the difference between @Controller and @RestController?**
> @RestController = @Controller + @ResponseBody on every method. It automatically serializes return values to JSON. @Controller is used with views (Thymeleaf/JSP) where you return view names.

**Q: How does Spring MVC process a request?**
> DispatcherServlet → HandlerMapping finds the Controller method → HandlerAdapter calls it → Return value is serialized (JSON) → Response written back to client.
