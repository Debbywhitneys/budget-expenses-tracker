# Budget & Expenses Tracker API

A comprehensive personal finance management API with group expense splitting capabilities, built with NestJS and Microsoft SQL Server.

## 🚀 Overview

This application provides a complete personal finance management solution with the following key features:

- **Personal Finance Management**: Track income, expenses, budgets, and financial goals
- **Group Expense Splitting**: Create groups and split expenses with friends, family, or colleagues
- **Advanced Analytics**: Rich reporting and insights on spending patterns
- **Real-time Notifications**: Budget alerts, goal milestones, and group expense updates
- **Role-based Access Control**: Secure authentication with system admin and user roles
- **Multi-currency Support**: Handle different currencies and timezones

## 🏗️ Architecture Overview

### Technology Stack
- **Backend Framework**: NestJS (Node.js)
- **Database**: Microsoft SQL Server
- **ORM**: TypeORM
- **Authentication**: JWT (Access + Refresh tokens)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt

### Application Structure

```
src/
├── auth/                 # Authentication & authorization
├── users/               # User management
├── accounts/            # Financial accounts (bank, cash, credit cards)
├── transactions/        # Income/expense transactions
├── categories/          # Expense/income categories
├── budgets/             # Budget management and tracking
├── financial-goals/     # Savings goals and milestones
├── groups/              # Expense sharing groups
├── groups-members/      # Group membership management
├── groups-expenses/     # Group expense tracking
├── expense-splits/      # Expense splitting logic
├── settlements/         # Settlement tracking between group members
├── notifications/       # Real-time notifications
├── recurring-transactions/ # Automated recurring transactions
├── database/           # Database configuration
├── migrations/         # Database migrations
├── logger/             # Application logging
└── seed/               # Database seeding
```

## 🗄️ Database Model

### Core Entities

#### **User Entity**
- Personal information (email, username, fullName, phone)
- Authentication (passwordHash, hashedRefreshToken)
- Preferences (currency, timezone)
- Role-based access (userRole: SYSTEM_ADMIN | USER)

#### **Account Entity**
- Financial accounts (credit_card, cash, bank)
- Balance tracking (initial_balance, current_balance)
- Institution details and metadata

#### **Transaction Entity**
- Income, expense, and transfer tracking
- Categorization and tagging
- Location and receipt management
- Recurring transaction support

#### **Group & Expense Splitting**
- **Group**: Expense sharing groups with types (couples, family, friends, etc.)
- **GroupMember**: Member roles (admin, member) and join tracking
- **GroupExpense**: Shared expenses with multiple split methods
- **RecurringSplit**: Individual shares and settlement tracking

#### **Budget & Goals**
- **Budget**: Periodic budgets (weekly, monthly, yearly) with alerts
- **FinancialGoal**: Savings targets with milestones and progress tracking

#### **Support Entities**
- **Category**: Custom categories for transactions
- **Notification**: System notifications and alerts
- **Settlement**: Money transfers between group members

### Entity Relationships

```
User
├── accounts (1:N)
├── transactions (1:N)
├── categories (1:N)
├── budgets (1:N)
├── financialGoals (1:N)
├── notifications (1:N)
├── groupMembers (1:N)
└── groupExpenses (as payer) (1:N)

Group
├── members (1:N)
├── expenses (1:N)
└── settlements (1:N)

GroupExpense
├── splits (1:N)
└── paidBy (N:1 User)
```

## 🔐 Authentication & Authorization

### JWT Authentication System
- **Access Tokens**: 2-hour expiration for API access
- **Refresh Tokens**: 7-day expiration for token renewal
- **Secure Storage**: Refresh tokens are hashed before storage
- **Auto-validation**: Global guard protects all endpoints

### Role-Based Access Control
- **SYSTEM_ADMIN**: Full system access
- **USER**: Standard user permissions
- **Group Roles**: Admin/Member roles within groups

### Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT signature verification
- Protected route decorators
- Input validation and sanitization

## 📊 Core Features Breakdown

### 1. Personal Finance Management

#### **Account Management**
- Create multiple account types (bank, cash, credit card)
- Track initial and current balances
- Archive inactive accounts
- Balance adjustment with audit trail

#### **Transaction Tracking**
- Income, expense, and transfer recording
- Category-based organization
- Receipt upload and location tracking
- Recurring transaction support
- Bulk operations and filtering

#### **Budget Management**
- Create budgets by category and period
- Real-time spending vs budget tracking
- Alert threshold notifications
- Budget rollover for unused amounts
- Visual progress indicators

### 2. Group Expense Splitting

#### **Group Management**
- Create groups for different purposes
- Add/remove members with admin controls
- Multiple group types supported
- Group member role management

#### **Expense Splitting Methods**
- **Equal Split**: Divide equally among all members
- **Percentage Split**: Custom percentages for each member
- **Exact Amounts**: Specific amounts for each member
- **Shares**: Weighted splitting system

#### **Settlement Tracking**
- Track who owes money to whom
- Settlement status monitoring
- Payment reference tracking
- Automatic balance calculations

### 3. Financial Analytics

#### **Spending Analysis**
- Spending by category breakdown
- Income vs expense trends
- Monthly/weekly/yearly comparisons
- Cash flow analysis

#### **Dashboard Summary**
- Current month overview
- Budget performance
- Top expense categories
- Recent transaction history
- Net worth calculations

#### **Goal Tracking**
- Financial goal progress
- Milestone notifications
- Savings allocation
- Achievement statistics

### 4. Notifications System

#### **Notification Types**
- Budget alerts (spending thresholds)
- Goal milestones (25%, 50%, 75%, 100%)
- Group expense updates
- System notifications

#### **Features**
- Read/unread status tracking
- Action URLs for direct navigation
- Bulk operations (mark all read)
- Unread count indicators

## 🌐 API Endpoints Overview

### Authentication
```
POST /auth/signup     # User registration
POST /auth/signin     # User login
```

### User Management
```
GET    /users              # List all users (admin)
GET    /users/:id          # Get user details
POST   /users              # Create user
PATCH  /users/:id          # Update user
DELETE /users/:id          # Delete user
```

### Accounts
```
GET    /accounts                    # User accounts
POST   /accounts                    # Create account
GET    /accounts/:id                # Account details
GET    /accounts/total-balance      # Total balance summary
PATCH  /accounts/:id                # Update account
PATCH  /accounts/:id/adjust-balance # Balance adjustment
PATCH  /accounts/:id/archive        # Archive account
DELETE /accounts/:id                # Delete account
```

### Transactions & Analytics
```
GET /analytics/spending-by-category      # Category breakdown
GET /analytics/income-expense-trends     # Trend analysis
GET /analytics/monthly-comparison/:year  # Monthly comparison
GET /analytics/cash-flow                 # Cash flow analysis
GET /analytics/net-worth/:userId         # Net worth calculation
GET /analytics/dashboard-summary/:userId # Dashboard data
```

### Budgets
```
GET    /budgets              # User budgets with spending
POST   /budgets              # Create budget
GET    /budgets/:id          # Budget details
PATCH  /budgets/:id          # Update budget
DELETE /budgets/:id          # Delete budget
GET    /budgets/vs-actual    # Budget vs actual report
POST   /budgets/rollover     # Rollover unused budget
```

### Groups & Expense Splitting
```
GET    /groups                    # User groups
POST   /groups                    # Create group
GET    /groups/:id                # Group details
GET    /groups/:id/balances       # Group balance summary
PATCH  /groups/:id                # Update group
DELETE /groups/:id                # Delete group

POST   /groups/:groupId/expenses           # Create group expense
GET    /groups/:groupId/expenses           # Group expenses
GET    /groups/:groupId/expenses/export    # Export to CSV
GET    /groups/:groupId/expenses/:id       # Expense details
PATCH  /groups/:groupId/expenses/:id       # Update expense
DELETE /groups/:groupId/expenses/:id       # Delete expense
```

### Financial Goals
```
GET  /financial-goals         # User goals
POST /financial-goals         # Create goal
GET  /financial-goals/:id     # Goal details
PATCH /financial-goals/:id    # Update goal
PATCH /financial-goals/:id/allocate  # Add money to goal
GET  /financial-goals/statistics     # Goal statistics
```

### Notifications
```
GET    /notifications              # User notifications
GET    /notifications/unread-count # Unread count
PATCH  /notifications/:id/read     # Mark as read
PATCH  /notifications/read-all     # Mark all read
DELETE /notifications/:id          # Delete notification
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Microsoft SQL Server
- pnpm (preferred) or npm

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=BudgetExpensesTracker
DB_SCHEMA=dbo
DB_SYNC=false
DB_LOGGING=false
DB_ENCRYPT=true
DB_TRUST_CERT=true
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Application
PORT=3002
NODE_ENV=development
```

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd budget-expenses-tracker
   pnpm install
   ```

2. **Database Setup**
   ```bash
   # Create database
   # Run migrations
   pnpm run migration:run
   ```

3. **Development Server**
   ```bash
   pnpm run start:dev
   ```

4. **Production Build**
   ```bash
   pnpm run build
   pnpm run start:prod
   ```

### Database Migrations
```bash
# Generate migration
pnpm run migration:generate -- src/migrations/MigrationName

# Create migration file
pnpm run migration:create -- src/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show
```

## 💡 Usage Examples

### 1. User Registration & Authentication

```bash
# Register new user
curl -X POST http://localhost:3002/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "johndoe",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "currency": "USD",
    "timezone": "America/New_York"
  }'

# Login
curl -X POST http://localhost:3002/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Account Management

```bash
# Create bank account (include Authorization header)
curl -X POST http://localhost:3002/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Checking",
    "type": "bank",
    "currency": "USD",
    "initial_balance": 1000.00,
    "institution_name": "Chase Bank",
    "account_number": "****1234"
  }'

# Get total balance
curl -X GET http://localhost:3002/accounts/total-balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create Budget

```bash
curl -X POST http://localhost:3002/budgets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "name": "Monthly Groceries",
    "amount": 500.00,
    "period": "monthly",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "alert_threshold": 80.00
  }'
```

### 4. Group Expense Splitting

```bash
# Create group
curl -X POST http://localhost:3002/groups \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Roommate Expenses",
    "description": "Shared apartment expenses",
    "group_type": "roommates"
  }'

# Add members to group
# Note: This would typically be done through group membership endpoints

# Create group expense with equal split
curl -X POST http://localhost:3002/groups/1/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grocery Shopping",
    "description": "Weekly grocery run",
    "total_amount": 120.00,
    "currency": "USD",
    "category_id": 1,
    "expense_date": "2025-01-15",
    "split_method": "equal",
    "members": [
      {"user_id": 1},
      {"user_id": 2},
      {"user_id": 3}
    ]
  }'
```

### 5. Financial Analytics

```bash
# Get spending by category
curl -X GET "http://localhost:3002/analytics/spending-by-category?userId=1&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get monthly comparison
curl -X GET http://localhost:3002/analytics/monthly-comparison/1/2025 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Financial Goals

```bash
# Create savings goal
curl -X POST http://localhost:3002/financial-goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Emergency Fund",
    "target_amount": 5000.00,
    "deadline": "2025-12-31",
    "category": "emergency",
    "financial_goal_type": "emergency_fund",
    "priority": "high"
  }'

# Allocate money to goal
curl -X PATCH http://localhost:3002/financial-goals/1/allocate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 250.00}'
```

## 📈 Key Features Deep Dive

### 1. Advanced Expense Splitting
- **Equal Split**: Automatically divides expense equally among all members
- **Percentage Split**: Allows custom percentage splits (e.g., 40%, 30%, 30%)
- **Exact Amounts**: Specify exact amounts each person owes
- **Validation**: Ensures split totals match expense total
- **Settlement Tracking**: Track who has paid their share

### 2. Smart Budget Management
- **Real-time Tracking**: Live budget vs actual spending
- **Alert System**: Notifications at threshold percentages
- **Flexible Periods**: Weekly, monthly, yearly budgets
- **Rollover Support**: Unused budget rolls to next period
- **Category Integration**: Link budgets to transaction categories

### 3. Comprehensive Analytics
- **Spending Patterns**: Category-based analysis
- **Trend Analysis**: Income vs expense over time
- **Net Worth Calculation**: Assets minus liabilities
- **Cash Flow Analysis**: Operating, investing, financing cash flows
- **Monthly Comparisons**: Year-over-year and month-over-month

### 4. Group Collaboration
- **Flexible Group Types**: Couples, family, friends, roommates, organizations
- **Role-based Permissions**: Admin controls for group management
- **Expense Notifications**: Automatic alerts to group members
- **Balance Tracking**: Real-time group member balance calculations
- **CSV Export**: Export group expenses for external analysis

## 🔧 Development Guidelines

### Code Structure
- **Modular Architecture**: Each feature is a separate module
- **Entity Relationships**: Well-defined TypeORM relationships
- **Service Layer**: Business logic separation
- **DTO Validation**: Request/response validation
- **Error Handling**: Comprehensive exception handling

### Best Practices
- **Type Safety**: Full TypeScript implementation
- **Database Indexing**: Optimized for performance
- **Input Validation**: Class-validator for all inputs
- **Logging**: Structured logging throughout
- **Testing**: Unit and integration test support

### API Design Principles
- **RESTful**: Standard HTTP methods and status codes
- **Consistent**: Uniform response formats
- **Documented**: Swagger/OpenAPI documentation
- **Secure**: JWT authentication and authorization
- **Scalable**: Database connection pooling

## 🚀 Deployment Considerations

### Production Setup
- **Environment Variables**: Secure configuration management
- **Database**: SQL Server with connection pooling
- **SSL/TLS**: Encrypted connections
- **Logging**: Structured logging for monitoring
- **Health Checks**: Application health monitoring

### Performance Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Consider Redis for session management
- **Monitoring**: Application and database monitoring
- **Backup Strategy**: Regular database backups

## 📝 API Documentation

Full API documentation is available at:
- **Swagger UI**: `http://localhost:3002/api/docs`
- **JSON Schema**: `http://localhost:3002/api/json`

The Swagger documentation provides:
- Interactive API testing
- Request/response schemas
- Authentication setup
- Example requests
- Error response documentation

---

This Budget & Expenses Tracker API provides a complete solution for personal and group expense management with robust features for tracking, analysis, and collaboration. The modular architecture ensures maintainability and scalability for future enhancements.
