describe("NGO User Registration - E2E Tests", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  describe("Registration Page Display", () => {
    it("should display registration page", () => {
      cy.get("body").should("be.visible");
      cy.url().should("include", "/register");
    });

    it("should have submit button", () => {
      cy.get('button[type="submit"]').should("exist");
    });
  });

  describe("Navigation", () => {
    it("should navigate to login when clicking login link", () => {
      cy.visit("/login");
      cy.url().should("include", "/login");
    });
  });
});
