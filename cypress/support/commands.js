// Custom Cypress commands

// Login command — reusable across tests
Cypress.Commands.add("login", (username = "testdonor", password = "TestPass@123") => {
  cy.visit("/login");
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Set localStorage session directly (bypass UI login for speed)
Cypress.Commands.add("setSession", (userData) => {
  const session = {
    ...userData,
    _expiresAt: Date.now() + 3600 * 1000,
  };
  window.localStorage.setItem("currentUser", JSON.stringify(session));
});

// NGO Login command
Cypress.Commands.add("ngoLogin", (username = "AAA20265600", password = "osloCC@123") => {
  cy.visit("/login");
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/ngo-dashboard");
});

// Register NGO command
Cypress.Commands.add("registerNgo", (ngoData = {}) => {
  const defaultData = {
    name: `Test NGO ${Date.now()}`,
    email: `ngo${Date.now()}@test.com`,
    phone: "1234567890",
    password: "SecurePass123!@#",
    registrationNumber: "REG123456",
  };
  const data = { ...defaultData, ...ngoData };

  cy.visit("/register");
  cy.get('input[placeholder*="NGO Name"]').type(data.name);
  cy.get('input[placeholder*="Email"]').type(data.email);
  cy.get('input[placeholder*="Phone"]').type(data.phone);
  cy.get('input[placeholder*="Password"]').type(data.password);
  cy.get('input[placeholder*="Confirm Password"]').type(data.password);
  cy.get('input[placeholder*="Registration Number"]').type(data.registrationNumber);
  cy.get('input[type="checkbox"]').check();
  cy.get('button[type="submit"]').click();
  cy.get(".success, [role='alert']").should("exist");
});

// Create food request command
Cypress.Commands.add("createFoodRequest", (requestData = {}) => {
  const defaultData = {
    foodType: "Cooked Food",
    quantity: "50",
    unit: "servings",
    description: "Test food request",
    pickupLocation: "123 Main St",
    pickupTime: "2025-12-31T10:00",
  };
  const data = { ...defaultData, ...requestData };

  cy.get("button").contains(/create|new|add/i).contains(/request|food/i).click();
  cy.get('input[placeholder*="Food Type"]').type(data.foodType);
  cy.get('input[placeholder*="Quantity"]').type(data.quantity);
  cy.get('input[placeholder*="Unit"]').type(data.unit);
  cy.get('textarea[placeholder*="Description"]').type(data.description);
  cy.get('input[placeholder*="Pickup Location"]').type(data.pickupLocation);
  cy.get('input[placeholder*="Pickup Time"]').type(data.pickupTime);
  cy.get('button[type="submit"]').click();
  cy.get(".success, [role='alert']").should("exist");
});

// Add address command
Cypress.Commands.add("addAddress", (addressData = {}) => {
  const defaultData = {
    street: "123 Main St",
    city: "Test City",
    state: "Test State",
    zip: "12345",
    country: "Test Country",
    isPrimary: true,
  };
  const data = { ...defaultData, ...addressData };

  cy.get("button").contains(/address|location/i).click();
  cy.get('input[placeholder*="Street"]').type(data.street);
  cy.get('input[placeholder*="City"]').type(data.city);
  cy.get('input[placeholder*="State"]').type(data.state);
  cy.get('input[placeholder*="Zip"]').type(data.zip);
  cy.get('input[placeholder*="Country"]').type(data.country);
  cy.get(".leaflet-container, .map").click(640, 360);
  if (data.isPrimary) {
    cy.get('input[type="checkbox"]').check();
  }
  cy.get('button[type="submit"]').click();
  cy.get(".success, [role='alert']").should("exist");
});

// Make donation command
Cypress.Commands.add("makeDonation", (donationData = {}) => {
  const defaultData = {
    amount: "100",
    currency: "USD",
    paymentMethod: "Card",
    cardNumber: "4532015112830366",
    expiry: "12/25",
    cvv: "123",
  };
  const data = { ...defaultData, ...donationData };

  cy.get("button").contains(/donate|payment|pay/i).click();
  cy.get('input[placeholder*="Amount"]').type(data.amount);
  cy.get('select[placeholder*="Currency"]').select(data.currency);
  cy.get('select[placeholder*="Payment Method"]').select(data.paymentMethod);
  cy.get('input[placeholder*="Card Number"]').type(data.cardNumber);
  cy.get('input[placeholder*="Expiry"]').type(data.expiry);
  cy.get('input[placeholder*="CVV"]').type(data.cvv);
  cy.get('button[type="submit"]').click();
  cy.get(".success, [role='alert']").should("exist");
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.get("button").contains(/logout|sign out/i).click();
  cy.get("button").contains(/confirm|yes/i).click();
  cy.url().should("include", "/login");
});

// Admin registration command
Cypress.Commands.add("registerAdmin", (adminData = {}) => {
  const defaultData = {
    username: `testadmin${Date.now()}`,
    password: "Password123!",
    confirmPassword: "Password123!",
    name: "Test Admin",
    email: `admin${Date.now()}@test.com`,
    phone: "+94771234567"
  };
  const data = { ...defaultData, ...adminData };

  cy.visit("/admin-dashboard?page=register");
  cy.get('input[name="name"]').type(data.name);
  cy.get('input[name="username"]').type(data.username);
  cy.get('input[name="email"]').type(data.email);
  cy.get('input[name="phone"]').type(data.phone);
  cy.get('input[name="password"]').type(data.password);
  cy.get('input[name="confirmPassword"]').type(data.confirmPassword);
  cy.get('button[type="submit"]').click();
  cy.get(".admin-registration-success").should("be.visible");
});

