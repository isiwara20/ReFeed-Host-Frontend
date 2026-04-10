describe("Restaurant Page", () => {
  const session = () => ({
    username: "testdonor",
    role: "DONATOR",
    _expiresAt: Date.now() + 3600 * 1000,
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify(session()));
    });
  });

  it("loads the restaurant form when no restaurant exists", () => {
    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 }).as("getRestaurant");
    cy.visit("/restaurant");
    cy.wait("@getRestaurant");
    cy.get(".rst-page").should("exist");
    cy.get(".rst-form-card").should("be.visible");
    cy.get("form").should("exist");
  });

  it("shows validation error when submitting without required fields", () => {
    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 });
    cy.visit("/restaurant");
    cy.get('button[type="submit"]').first().click();
    cy.get(".rst-alert-error").should("be.visible");
    cy.get(".rst-alert-error").should("contain", "required");
  });

  it("pre-fills form when restaurant already exists", () => {
    cy.intercept("GET", "**/api/restaurant/mine", {
      statusCode: 200,
      body: {
        name: "Green Bites",
        address: "123 Main St, Colombo",
        phone: "+94771234567",
        foodsServed: "Rice, Curry",
        openingHours: "Mon-Sat 8am-10pm",
        description: "Fresh food daily",
        image: "",
      },
    }).as("getRestaurant");
    cy.visit("/restaurant");
    cy.wait("@getRestaurant");
    cy.get('input[placeholder="e.g. Green Bites"]').should("have.value", "Green Bites");
    cy.get('input[placeholder="123 Main St, Colombo"]').should("have.value", "123 Main St, Colombo");
  });

  it("shows preview card when name is typed", () => {
    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 });
    cy.visit("/restaurant");
    cy.get('input[placeholder="e.g. Green Bites"]').type("My Restaurant");
    cy.get(".rst-preview-card").should("be.visible");
    cy.get(".rst-preview-name").should("contain", "My Restaurant");
  });

  it("shows success message after saving", () => {
    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 });
    cy.intercept("POST", "**/api/restaurant", {
      statusCode: 200,
      body: { name: "Green Bites", address: "123 Main St" },
    }).as("saveRestaurant");
    cy.visit("/restaurant");
    cy.get('input[placeholder="e.g. Green Bites"]').type("Green Bites");
    cy.get('input[placeholder="123 Main St, Colombo"]').type("123 Main St, Colombo");
    cy.get('button[type="submit"]').first().click();
    cy.wait("@saveRestaurant");
    cy.get(".rst-alert-success").should("be.visible");
  });
});
