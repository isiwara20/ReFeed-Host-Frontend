# Frontend E2E Tests - NGO User Registration

##  Status: All 73 Tests Passing

```
 Test Suites: 7 files
 Tests:       73 passing
 Success Rate: 100%
```

---

##  How to Run Tests

### Prerequisites
```bash
# Terminal 1: Start Frontend Server
cd frontend
npm start

# Terminal 2: Start Backend Server
cd backend
npm start
```

### Run Tests
```bash
# Terminal 3: Run all tests (headless)
cd frontend
npm run cypress:run
npm run test:frontend

# Or run specific test file
npm run cypress:run -- --spec "cypress/e2e/ngo_userReg/registration.cy.js"

# Or open Cypress UI (interactive)
npm run cypress:open
```

---

##  Test Files (7 total)

| File | Tests | Status |
|------|-------|--------|
| registration.cy.js | 5 | ✅ |
| passwordReset.cy.js | 4 | ✅ |
| foodRequest.cy.js | 8 | ✅ |
| ngoDashboard.cy.js | 11 | ✅ |
| donationPayment.cy.js | 8 | ✅ |
| completeWorkflow.cy.js | 18 | ✅ |
| addressManagement.cy.js | 19 | ✅ |
| **TOTAL** | **73** | **✅** |

---

##  Test Credentials

```
Username: AAA20265600
Password: osloCC@123
```

---

##  What's Tested

- Page visibility and loading
- URL correctness after navigation
- Navigation elements presence
- Session persistence on reload
- Responsive design (desktop/tablet/mobile)
- User data in localStorage
- Navigation links functionality

---

**Status**:  Production Ready
