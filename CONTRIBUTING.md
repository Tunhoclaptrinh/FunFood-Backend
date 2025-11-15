# 🤝 Contributing to FunFood Backend

## Mục lục

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Testing](#testing)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

### Our Pledge

Chúng tôi cam kết duy trì một cộng đồng mở và thân thiện, nơi mọi người đều được tôn trọng và hỗ trợ.

### Expected Behavior

- 🤝 Hỗ trợ lẫn nhau
- 🙏 Tôn trọng các ý kiến khác
- 📚 Trao đổi kiến thức
- ✨ Giúp dự án thành công

### Unacceptable Behavior

- ❌ Quấy rối, lạm dụng
- ❌ Kỳ thị
- ❌ Spam
- ❌ Đánh cắp mã

---

## Getting Started

### Prerequisites

- Node.js 18.x+
- npm 9.x+
- Git
- PostgreSQL hoặc MongoDB (tuỳ chọn)
- Postman hoặc Thunder Client (để test API)

### Fork & Clone

```bash
# 1. Fork repository trên GitHub
# https://github.com/yourname/funfood-backend

# 2. Clone fork của bạn
git clone https://github.com/yourname/funfood-backend.git
cd funfood-backend

# 3. Add upstream remote
git remote add upstream https://github.com/original/funfood-backend.git

# 4. Verify remotes
git remote -v
# origin    - Your fork
# upstream  - Original repo
```

---

## Development Setup

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.develop .env

# 3. Seed database
npm run seed

# 4. Start development
npm run dev
```

### Recommended Tools

- **Code Editor**: VS Code
  - Extensions: ESLint, Prettier, REST Client
- **API Testing**: Postman, Insomnia
- **Database**: MongoDB Compass, pgAdmin
- **Git GUI**: GitHub Desktop, GitKraken

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "humao.rest-client",
    "mongodb.mongodb-vscode",
    "eamodio.gitlens"
  ]
}
```

---

## Coding Standards

### JavaScript Style Guide

```javascript
// ✅ Good
const getUserById = async (userId) => {
  try {
    const user = db.findById("users", userId);
    if (!user) {
      return {success: false, message: "User not found"};
    }
    return {success: true, data: user};
  } catch (error) {
    throw error;
  }
};

// ❌ Bad
function getUser(id) {
  var u = db.findById("users", id);
  if (u) return u;
}
```

### Naming Conventions

```javascript
// Files
- service files: userService.js (camelCase)
- controller files: userController.js (camelCase)
- routes files: user.routes.js (kebab-case with dot)

// Variables
const maxRetries = 3;                    // ✅ camelCase
let isActive = true;                     // ✅ Boolean with 'is' prefix
const USER_ROLE_ADMIN = 'admin';        // ✅ Constants UPPER_SNAKE_CASE

// Functions
async function createUser(data) {}        // ✅ verb + noun
const validateEmail = (email) => {}       // ✅ verb + noun
```

### Code Format

```bash
# Format code
npm run format

# Or use Prettier directly
npx prettier --write "**/*.js"
```

### Comments

```javascript
// ✅ Good - explain WHY, not WHAT
// User needs to be active to place orders
if (user.isActive) {
  await createOrder(data);
}

// ❌ Bad - obvious from code
// Set isActive to true
user.isActive = true;

// JSDoc for functions
/**
 * Calculate delivery fee based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {number} Delivery fee in VND
 * @example
 * calculateDeliveryFee(2.5) // 15000
 */
function calculateDeliveryFee(distance) {
  // ...
}
```

### File Structure

```javascript
// Order: imports → constants → functions → exports
const express = require("express");
const db = require("../config/database");

const DELIVERY_BASE_FEE = 15000;
const DELIVERY_PER_KM = 5000;

const calculateFee = (distance) => {
  // ...
};

module.exports = {calculateFee};
```

### Error Handling

```javascript
// ✅ Good - proper error handling
try {
  const user = db.findById("users", id);
  if (!user) {
    return {
      success: false,
      message: "User not found",
      statusCode: 404,
    };
  }
  return {success: true, data: user};
} catch (error) {
  console.error("Failed to get user:", error);
  throw error;
}

// ❌ Bad - swallowing errors
try {
  const user = db.findById("users", id);
  return user;
} catch (e) {
  // Silent fail
}
```

---

## Git Workflow

### Branch Naming

```bash
# Feature branch
git checkout -b feature/user-authentication

# Bug fix branch
git checkout -b bugfix/cart-calculation

# Improvement branch
git checkout -b improve/database-queries

# Documentation
git checkout -b docs/api-endpoints
```

### Commit Messages

```bash
# ✅ Good commit messages

# Feature
git commit -m "feat: add user authentication with JWT"

# Bug fix
git commit -m "fix: correct order total calculation"

# Documentation
git commit -m "docs: update API endpoints reference"

# Refactoring
git commit -m "refactor: extract payment logic to service"

# Performance
git commit -m "perf: optimize restaurant search with indexes"

# Test
git commit -m "test: add unit tests for order validation"

# ❌ Bad commit messages
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Build, dependencies

Example:

```bash
git commit -m "feat(orders): add order status tracking

- Add order status workflow validation
- Add notifications for status changes
- Add order history endpoint

Fixes #123
Related to #456"
```

### Pull & Rebase

```bash
# Keep your branch updated
git fetch upstream
git rebase upstream/main

# Or merge
git merge upstream/main

# Force push if rebased
git push origin feature/xyz --force-with-lease
```

---

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Example Test

```javascript
// __tests__/services/order.service.test.js

describe("OrderService", () => {
  describe("validateCreate", () => {
    it("should reject order with no items", async () => {
      const data = {restaurantId: 1, items: []};
      const result = await orderService.validateCreate(data);

      expect(result.success).toBe(false);
      expect(result.message).toContain("at least one item");
    });

    it("should accept valid order", async () => {
      const data = {
        restaurantId: 1,
        items: [{productId: 1, quantity: 2}],
      };
      const result = await orderService.validateCreate(data);

      expect(result.success).toBe(true);
    });
  });
});
```

### Manual Testing

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}'

# Test protected endpoint
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test with different methods
curl -X GET http://localhost:3000/api/restaurants
curl -X POST http://localhost:3000/api/cart
curl -X PUT http://localhost:3000/api/cart/1
curl -X DELETE http://localhost:3000/api/cart/1
```

---

## Pull Request Process

### Before Creating PR

```bash
# 1. Update from upstream
git fetch upstream
git rebase upstream/main

# 2. Run tests
npm test

# 3. Check code format
npm run format

# 4. Lint code
npm run lint

# 5. Update documentation
# - Update API_ENDPOINTS.md if needed
# - Update ARCHITECTURE.md if needed
# - Add comments to complex logic
```

### Creating PR

1. **Push your branch**

   ```bash
   git push origin feature/xyz
   ```

2. **Create Pull Request on GitHub**

   - Title: Clear, descriptive
   - Description: Follow template
   - Link related issues

3. **PR Template**

   ```markdown
   ## Description

   Explain the changes and why they're needed

   ## Type of Change

   - [ ] New feature
   - [ ] Bug fix
   - [ ] Documentation update

   ## Testing

   How to test the changes?

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] Tests added/updated
   - [ ] No console errors

   ## Screenshots/Videos

   If applicable

   ## Closes

   Fixes #123
   ```

### Code Review

- Respond to comments promptly
- Request changes from reviewers if needed
- Address all feedback before merging

### Merging

```bash
# Maintainer merges PR
# Usually done via GitHub UI

# Delete branch after merge
git branch -d feature/xyz
git push origin --delete feature/xyz
```

---

## Reporting Issues

### Issue Template

```markdown
## Description

Brief description of the issue

## Expected Behavior

What should happen?

## Actual Behavior

What actually happens?

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Environment

- Node version: 18.x
- npm version: 9.x
- OS: macOS/Windows/Linux

## Logs/Screenshots

Attach relevant logs or screenshots

## Possible Solution

If you have ideas for fixing this
```

### Reporting Security Issues

⚠️ **DO NOT create public GitHub issue for security vulnerabilities**

Instead:

1. Email: security@funfood.com
2. Include details and reproduction steps
3. Allow time for maintainers to patch

---

## Documentation

### Updating Documentation

```bash
# API documentation
# Edit: docs/API_ENDPOINTS.md
# Format endpoints as per existing examples
# Include request/response examples

# Architecture docs
# Edit: docs/ARCHITECTURE.md
# Update if you change fundamental structure

# README
# Update if you add features visible to users
```

### Documentation Standards

````markdown
# Headings

Use # for main, ## for sections, ### for subsections

# Code Examples

Include language: ```javascript

# Links

Use relative paths: [file](./README.md)

# Formatting

- **bold** for emphasis
- `code` for technical terms
- > for blockquotes/notes
````

---

## Running Locally

### Full Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Seed database
npm run seed

# 3. Start server
npm run dev

# 4. Test in another terminal
curl http://localhost:3000/api/health

# 5. Create test data
# Use Postman/Insomnia to create orders, reviews, etc.
```

### Database Management

```bash
# Backup database
cp database/db.json database/db.json.backup

# Reset database
rm database/db.json
npm run seed

# Restore from backup
cp database/db.json.backup database/db.json
```

---

## Performance Considerations

### What to Avoid

```javascript
// ❌ N+1 queries
orders.forEach((order) => {
  const user = db.findById("users", order.userId); // Repeated queries
});

// ✅ Batch query
const users = db.findMany("users", {id_in: userIds});

// ❌ Large data without pagination
db.findAll("orders"); // Could be thousands

// ✅ Paginated
db.findAllAdvanced("orders", {page: 1, limit: 10});

// ❌ Synchronous operations
const data = readFileSync("large-file.json");

// ✅ Asynchronous
const data = await readFile("large-file.json");
```

---

## Need Help?

- 📖 Read documentation in `/docs` folder
- 💬 Open an issue for questions
- 🤝 Start discussions on GitHub
- 📧 Email: dev@funfood.com

---

## Recognition

Contributors who submit meaningful PRs will be recognized in:

- CONTRIBUTORS.md
- GitHub credits
- Release notes

Thank you for contributing to FunFood! 🙏
