describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("displays the login page", () => {
    cy.get(".login-page").should("exist");
    cy.get('input[id="username"]').should("exist");
    cy.get('input[id="password"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  it("shows error on empty submit", () => {
    cy.get('button[type="submit"]').click();
    cy.get(".login-error").should("be.visible");
  });

  it("shows error on wrong credentials", () => {
    cy.get('input[id="username"]').type("wronguser");
    cy.get('input[id="password"]').type("wrongpass");
    cy.get('button[type="submit"]').click();
    cy.get(".login-error").should("be.visible");
  });

  it("navigates to donator dashboard on valid login", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        message: "Login successful",
        username: "testdonor",
        role: "DONATOR",
        dashboard: "/donator-dashboard",
        _id: "fake-id",
        name: "Test Donor",
        email: "test@refeed.lk",
      },
    }).as("loginRequest");

    cy.get('input[id="username"]').type("testdonor");
    cy.get('input[id="password"]').type("TestPass@123");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");
    cy.url().should("include", "/donator-dashboard");
  });

  it("redirects to login when accessing protected route without auth", () => {
    cy.visit("/donator-dashboard");
    cy.url().should("include", "/login");
  });

  it("toggle password visibility works", () => {
    cy.get('input[id="password"]').should("have.attr", "type", "password");
    cy.get(".login-toggle-pw").click();
    cy.get('input[id="password"]').should("have.attr", "type", "text");
  });
});
