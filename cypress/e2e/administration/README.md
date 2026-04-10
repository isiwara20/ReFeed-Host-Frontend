# Frontend E2E Tests - Administration

## Status: All 219 Tests Passing

```
Test Suites: 9 files
Tests:       219 passing
Success Rate: 100%
```

---

## How to Run Tests

### Prerequisites
```bash
# Terminal 1: Start Frontend Server
cd frontend
npm start

# Terminal 2: Start Backend Server
cd backend
npm start
```

### Run Admin Tests
```bash
# Run all admin E2E tests
npx cypress run --spec "cypress/e2e/administration/**/*.cy.js"

# Or open Cypress Test Runner
npx cypress open
# Navigate to: administration folder
```

---

## Test Files Overview

| File | Description |
|------|-------------|
| `adminDashboard.cy.js` | Dashboard display and navigation |
| `adminProfile.cy.js` | Profile management and editing |
| `adminRegistration.cy.js` | Admin registration form |
| `adminVerification.cy.js` | NGO and donor verification |
| `adminAnalytics.cy.js` | Analytics and reporting |
| `adminComplaintManagement.cy.js` | Complaint handling |
| `adminDonationOversight.cy.js` | Donation monitoring |
| `adminPerformance.cy.js` | Performance testing |
| `adminCompleteWorkflow.cy.js` | End-to-end workflows |

---

## Key Features Tested

- **Dashboard** - Page display, navigation, data visualization
- **User Management** - Profile editing, registration, verification
- **Admin Operations** - Complaint handling, donation oversight
- **Analytics** - Charts, metrics, data filtering
- **Performance** - Load testing, API response times

---

## Environment Setup

### Cypress Configuration
```javascript
// cypress.config.js
{
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js'
  }
}
```

### Environment Variables
```bash
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_API_URL=http://localhost:5000
```

---

**Last Updated**: April 2026
