# Budget Tracket — CLAUDE.md

## Project Overview

Budget Tracket is a personal finance management web application that helps users track income, expenses, and budgets. The app features AI-powered transaction categorization, spending analysis, and financial recommendations — all built on AWS serverless infrastructure.

**Design Philosophy:** Professional · Minimalist · Modern · User-friendly

---

## Tech Stack

| Thành phần     | Ngôn ngữ / Công nghệ                  |
| -------------- | ------------------------------------- |
| Frontend       | JavaScript (ReactJS)                  |
| Giao diện      | HTML5 + CSS3 (Tailwind CSS)           |
| Gọi API        | Axios (JavaScript)                    |
| Backend        | C# (.NET 8 — ASP.NET Core Web API)    |
| AWS Lambda     | C# (.NET 8)                           |
| Database       | Amazon DynamoDB (NoSQL)               |
| Authentication | Amazon Cognito (JWT)                  |
| Lưu file       | Amazon S3                             |
| API            | Amazon API Gateway                    |
| AI             | Amazon Bedrock                        |
| Queue          | Amazon SQS                            |
| Monitoring     | Amazon CloudWatch                     |
| Notification   | Amazon SNS                            |
| CDN            | Amazon CloudFront                     |
| DNS            | Amazon Route 53                       |
| Security       | AWS WAF                               |

### Frontend
- **Framework:** ReactJS (JavaScript — không dùng TypeScript)
- **Styling:** HTML5 + CSS3 · Tailwind CSS (minimalist, clean UI)
- **State Management:** React Context API hoặc Zustand
- **HTTP Client:** Axios
- **Hosting:** Amazon S3 (static site) + Amazon CloudFront (CDN)

### Backend (Serverless)
- **Runtime:** C# (.NET 8 — ASP.NET Core Web API)
- **API Gateway:** Amazon API Gateway (REST) → AWS Lambda
- **Lambda:** C# .NET 8 (mỗi Lambda là một handler riêng biệt)
- **Queue:** Amazon SQS (async processing)

### Authentication
- **Service:** Amazon Cognito
- **Method:** JWT tokens (access + refresh)
- **Flows:** Login, Register, Forgot Password

### Database & Storage
- **Primary DB:** Amazon DynamoDB (NoSQL)
- **File Storage:** Amazon S3 (receipts, attachments)

### AI & Intelligence
- **Service:** Amazon Bedrock
- **Features:**
  - Auto-categorize transactions (Food, Shopping, Bills, Entertainment, Transport)
  - Spending habit analysis (daily / weekly / monthly trends)
  - Financial recommendations & savings planning

### Infrastructure & Monitoring
- **CDN & Edge:** Amazon CloudFront
- **Security:** AWS WAF (attached to CloudFront)
- **DNS:** Amazon Route 53
- **Monitoring:** Amazon CloudWatch (logs, metrics, alarms)
- **Notifications:** Amazon SNS → User Email alerts

---

## Architecture Flow

```
User Browser
  │
  ├─(1)─► Route 53 (DNS resolution)
  │
  ├─(2)─► CloudFront (CDN) ──── AWS WAF (security layer)
  │              │
  │              └─► S3 (React app: HTML, CSS, JS)
  │
  ├─(3)─► API Gateway (HTTPS REST)
  │              │
  │              ├─(auth)─► Amazon Cognito → JWT Token
  │              │
  │              └─(api)──► AWS Lambda (business logic)
  │                               │
  │                               ├─► DynamoDB (read/write data)
  │                               ├─► S3 (store receipts/files)
  │                               ├─► SQS (async tasks)
  │                               ├─► Amazon Bedrock (AI analysis)
  │                               └─► CloudWatch (logs)
  │
  └─(alerts)─► CloudWatch → SNS → User Email
```

---

## Key Features

### Core Finance
- **Dashboard** — summary cards (balance, income, expenses, savings rate)
- **Transactions** — add, edit, delete income/expense entries
- **Budgets** — set monthly category budgets with progress tracking
- **Receipts** — upload and attach receipt images to transactions
- **Reports** — charts and graphs (monthly trends, category breakdown)

### AI Features (Amazon Bedrock)
- Auto-categorize new transactions based on description
- Weekly/monthly spending trend analysis
- Personalized savings recommendations
- Anomaly detection (unusual spending alerts)

### Notifications (SNS)
- Budget limit exceeded alerts
- Monthly summary email
- Unusual spending pattern warnings

---

## DynamoDB Data Model

```
PK (Partition Key)       SK (Sort Key)            Entity
─────────────────────────────────────────────────────────
USER#<userId>            PROFILE                  User profile
USER#<userId>            TXN#<timestamp>#<id>     Transaction
USER#<userId>            BUDGET#<year-month>      Monthly budget
USER#<userId>            CATEGORY#<name>          Category config
```

---

## Project Structure

```
budget-tracket/
├── frontend/                          # React (JavaScript) application
│   ├── public/
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ui/                    # Base: Button, Card, Input, Modal, Badge
│   │   │   ├── layout/                # Sidebar, Navbar, PageLayout
│   │   │   └── charts/                # Chart components (Recharts)
│   │   ├── pages/                     # Route-level pages
│   │   │   ├── Dashboard/
│   │   │   ├── Transactions/
│   │   │   ├── Budgets/
│   │   │   ├── Reports/
│   │   │   └── Settings/
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── services/                  # Axios API calls
│   │   ├── store/                     # Global state (Context / Zustand)
│   │   ├── utils/                     # Formatters, date helpers, currency
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                           # C# .NET 8 solution
│   ├── BudgetTracket.sln
│   ├── src/
│   │   ├── BudgetTracket.Lambda/      # Lambda function handlers (C#)
│   │   │   ├── Functions/
│   │   │   │   ├── TransactionFunction.cs
│   │   │   │   ├── BudgetFunction.cs
│   │   │   │   ├── ReportFunction.cs
│   │   │   │   ├── AiFunction.cs
│   │   │   │   └── NotificationFunction.cs
│   │   │   ├── Models/                # Request/Response DTOs
│   │   │   └── BudgetTracket.Lambda.csproj
│   │   │
│   │   └── BudgetTracket.Core/        # Shared business logic
│   │       ├── Services/              # Business logic services
│   │       ├── Repositories/          # DynamoDB data access
│   │       ├── Models/                # Domain models
│   │       ├── Validators/            # FluentValidation validators
│   │       └── BudgetTracket.Core.csproj
│   │
│   └── tests/
│       ├── BudgetTracket.Lambda.Tests/
│       └── BudgetTracket.Core.Tests/
│
├── infrastructure/                    # AWS SAM / CDK templates
│   ├── template.yaml                  # SAM template
│   └── cdk/                           # CDK stacks (optional)
│
└── CLAUDE.md
```

---

## Design System

### Color Palette
```
Primary:    #6366F1  (Indigo — actions, CTAs)
Success:    #10B981  (Emerald — income, positive)
Danger:     #EF4444  (Red — expenses, alerts)
Warning:    #F59E0B  (Amber — budget warnings)
Neutral:    #F9FAFB / #111827  (Background / Text)
```

### Design Principles
- **Minimalist UI** — no visual clutter; data is the hero
- **Card-based layout** — each widget in its own card with subtle shadow
- **Consistent spacing** — 4px base unit, 8px / 16px / 24px / 32px rhythm
- **Readable typography** — Inter or Plus Jakarta Sans, clear hierarchy
- **Responsive** — mobile-first, works on phone, tablet, desktop
- **Dark mode support** — via Tailwind `dark:` classes

### Component Standards
- All buttons use `rounded-xl` with clear hover/active states
- Form inputs use `rounded-lg` with focus ring (`ring-2 ring-indigo-500`)
- Modals use backdrop blur for depth
- Loading states use skeleton screens, not spinners
- Empty states include illustration + helpful CTA

---

## API Design

All endpoints are prefixed `/api/v1/` and require `Authorization: Bearer <jwt>`.

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /transactions          # list with filters (date, category, type)
POST   /transactions          # create
PUT    /transactions/:id      # update
DELETE /transactions/:id      # delete
POST   /transactions/:id/receipt  # upload receipt to S3

GET    /budgets               # current month budgets
POST   /budgets               # create/update budget
GET    /budgets/:year/:month  # historical

GET    /reports/summary       # dashboard totals
GET    /reports/trends        # monthly trend data
GET    /reports/categories    # breakdown by category

POST   /ai/categorize         # suggest category for a transaction
GET    /ai/insights           # spending insights & recommendations
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_AWS_REGION=
```

### Backend — Lambda Environment Variables
```
DYNAMODB_TABLE=
S3_BUCKET_RECEIPTS=
COGNITO_USER_POOL_ID=
BEDROCK_MODEL_ID=
SNS_TOPIC_ARN=
AWS_REGION=
ASPNETCORE_ENVIRONMENT=Production
```

---

## Development Guidelines

### Frontend Code Style (JavaScript / ReactJS)
- Dùng JavaScript thuần — không dùng TypeScript
- Functional components với hooks (không dùng class components)
- Mỗi component một file; đặt tên file theo PascalCase (`TransactionCard.jsx`)
- Dùng named exports (không dùng default export) để dễ refactor
- PropTypes để document props của component nếu cần
- JSDoc comment cho functions phức tạp

### Backend Code Style (C# .NET 8)
- Tuân theo C# Coding Conventions của Microsoft
- Dùng `record` cho DTOs / Request / Response models
- Dùng **FluentValidation** để validate input tại Lambda boundary
- Dùng `AWSSDK.DynamoDBv2` với `DynamoDBContext` (Document Model)
- Mỗi Lambda Function handler riêng biệt, inject dependency qua constructor
- Return consistent response: `ApiResponse<T> { Success, Data, Error, Message }`
- Async/await toàn bộ — không dùng `.Result` hay `.Wait()`

### Git Conventions
```
feat:     tính năng mới
fix:      sửa lỗi
ui:       thay đổi giao diện / style
refactor: tái cấu trúc code (không thay đổi hành vi)
chore:    build, deps, config, hạ tầng
```

### Lambda Best Practices (C# .NET 8)
- Mỗi Lambda tập trung vào một resource (transactions, budgets, ...)
- Dùng `IServiceCollection` / Dependency Injection trong `Startup.cs` hoặc `LambdaEntryPoint`
- Khởi tạo DynamoDB client ngoài handler (tái sử dụng connection pool)
- Validate input bằng FluentValidation trước khi xử lý
- Log bằng `ILogger<T>` — tự động gửi lên CloudWatch
- Cold start: dùng `dotnet lambda package` với AOT nếu cần tốc độ

### Security Rules
- Không bao giờ log JWT token hoặc thông tin đăng nhập
- Validate toàn bộ input người dùng trước khi ghi vào DynamoDB
- URL S3 cho receipts phải là pre-signed URL (không public)
- WAF rules: chặn SQL injection, XSS, rate-limit endpoint login

---

## Testing Strategy

- **Frontend unit tests:** Vitest + React Testing Library (JavaScript)
- **Backend unit tests:** xUnit (.NET 8) cho Services và Repositories
- **Integration tests:** xUnit với DynamoDB Local (Docker) cho Lambda handlers
- **E2E:** Playwright cho critical flows (login → add transaction → view dashboard)
- Minimum coverage: 70% cho business logic trong `BudgetTracket.Core`

---

## Deployment

1. **Infrastructure:** Deploy via AWS SAM (`sam build && sam deploy`) hoặc CDK (`cdk deploy`)
2. **Backend (C# Lambda):** `dotnet lambda package` → SAM deploy → GitHub Actions CI/CD
3. **Frontend (React):** `npm run build` → `aws s3 sync` → CloudFront invalidation
4. **Environments:** `dev` → `staging` → `prod` (dùng SAM parameter overrides hoặc separate stacks)

---

## Out of Scope (v1)

- Multi-currency support
- Bank account syncing (Plaid/TrueLayer)
- Mobile native app (React Native)
- Team/family shared budgets
- Tax reporting

---

*Last updated: 2026-06-30*
