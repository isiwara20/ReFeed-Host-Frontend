describe("Admin Donation Oversight - E2E Tests", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "admin001",
        role: "ADMIN",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });

    cy.intercept("GET", "**/admin/dashboard/summary", {
      statusCode: 200,
      body: { totalUsers: 1250, totalNGOs: 45, totalDonations: 3200 }
    }).as("getDashboardSummary");

    cy.intercept("GET", "**/admin/donations?*", {
      statusCode: 200,
      body: []
    }).as("getDonations");
  });

  describe("Page Display", () => {
    it("should display donation oversight page", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.wait("@getDashboardSummary");
      cy.wait("@getDonations");
      cy.get(".donation-oversight").should("exist");
    });

    it("should display page header", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.get(".donation-oversight-title").should("contain", "Donation Oversight");
    });

    it("should display statistics cards", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.get(".donation-stats-grid").should("exist");
      cy.get(".donation-stat-card").should("have.length", 4);
    });
  });

  describe("Empty State", () => {
    it("should handle empty donations list", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.get(".donation-oversight").should("exist");
    });
  });

  describe("Error Handling", () => {
    it("should handle API error gracefully", () => {
      cy.intercept("GET", "**/admin/donations?*", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("fetchError");

      cy.visit("/admin-dashboard?page=donations");
      cy.wait("@fetchError");
      cy.get(".donation-oversight-error").should("be.visible");
    });
  });
});
