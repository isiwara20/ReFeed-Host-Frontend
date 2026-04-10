describe("NGO Password Reset - E2E Tests", () => {
  beforeEach(() => {
    cy.visit("/forgot-password");
  });

  describe("Forgot Password Page Display", () => {
    it("should display forgot password page", () => {
      cy.get("body").should("be.visible");
      cy.url().should("include", "/forgot-password");
    });

    it("should display back to login link", () => {
      cy.get("a").contains(/login|back/i).should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should navigate back to login", () => {
      cy.get("a").contains(/login|back/i).click();
      cy.url().should("include", "/login");
    });
  });
});
