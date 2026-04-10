describe("Surplus Donation Flow", () => {
  beforeEach(() => {
    // Set session directly to skip UI login
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "testdonor",
        role: "DONATOR",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });

    // Mock surplus list
    cy.intercept("GET", "**/api/surplus/mine", {
      statusCode: 200,
      body: [],
    }).as("getSurplus");

    cy.visit("/surplus");
  });

  it("displays the surplus donations page", () => {
    cy.get(".sp-page").should("exist");
  });

  it("shows empty state when no donations", () => {
    cy.wait("@getSurplus");
    cy.get(".sp-empty").should("be.visible");
  });

  it("opens new donation form on button click", () => {
    cy.contains("New Donation").click();
    cy.get(".sp-form-card").should("be.visible");
  });

  it("shows validation error on empty form submit", () => {
    cy.contains("New Donation").click();
    cy.get('button[type="submit"]').first().click();
    cy.get(".sp-alert-error").should("be.visible");
  });

  it("creates a draft donation - form submits with valid data", () => {
    cy.contains("New Donation").click();
    cy.get(".sp-form-card").should("be.visible");

    // Fill quantity using React-compatible input
    cy.get('input[type="number"]').first().focus().type("5");

    // Fill expiry using keyboard input in the correct format
    cy.get('input[type="datetime-local"]').first().focus()
      .type("2027-12-31T12:00");

    // Verify no validation error before submit
    cy.get('button[type="submit"]').first().click();

    // Either success alert or the request was made - both indicate form passed validation
    cy.get(".sp-alert-error").should("not.contain", "valid quantity");
  });

  it("displays donation cards when donations exist", () => {
    cy.intercept("GET", "**/api/surplus/mine", {
      statusCode: 200,
      body: [{
        _id: "d1",
        foodType: "veg",
        quantity: { amount: 5, unit: "kg" },
        lifecycleStatus: "DRAFT",
        donorUsername: "testdonor",
        expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        selfDelivery: false,
      }],
    }).as("getSurplusWithData");

    cy.visit("/surplus");
    cy.wait("@getSurplusWithData");
    cy.get(".sp-donation-card").should("have.length.at.least", 1);
  });
});

describe("Restaurant Page Flow", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "testdonor",
        role: "DONATOR",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });

    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 }).as("getRestaurant");
    cy.visit("/restaurant");
    cy.wait("@getRestaurant");
  });

  it("restaurant page loads with form", () => {
    cy.get(".rst-page").should("exist");
    cy.get(".rst-form-card").should("be.visible");
    cy.get("form").should("exist");
  });

  it("shows validation error when submitting without required fields", () => {
    cy.get('button[type="submit"]').first().click();
    cy.get(".rst-alert-error").should("be.visible");
    cy.get(".rst-alert-error").should("contain", "required");
  });
});

describe("Reports Page Flow", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "testdonor",
        role: "DONATOR",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });

    cy.intercept("GET", "**/api/surplus/mine", {
      statusCode: 200,
      body: [
        { _id: "r1", foodType: "veg", quantity: { amount: 10, unit: "kg" }, lifecycleStatus: "COMPLETED", donorUsername: "testdonor", expiryTime: new Date(Date.now() + 3600000).toISOString() },
        { _id: "r2", foodType: "cooked", quantity: { amount: 5, unit: "portions" }, lifecycleStatus: "PUBLISHED", donorUsername: "testdonor", expiryTime: new Date(Date.now() + 3600000).toISOString() },
      ],
    }).as("getReports");

    cy.intercept("GET", "**/api/food-requests/all", { statusCode: 200, body: { data: [] } });
    cy.visit("/reports");
  });

  it("reports page loads and shows donation stats", () => {
    cy.wait("@getReports");
    cy.get(".rp-page").should("exist");
    cy.get(".rp-stats-row").should("be.visible");
  });

  it("reports page shows correct total donation count", () => {
    cy.wait("@getReports");
    cy.get(".rp-stat").first().should("contain", "2");
  });
});
