describe("Admin Dashboard - E2E Tests", () => {
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

    cy.visit("/admin-dashboard");
    cy.wait("@getDashboardSummary");
  });

  describe("Page Display", () => {
    it("should display dashboard", () => {
      cy.get(".admin-dashboard").should("exist");
    });

    it("should display navigation", () => {
      cy.get("nav, .sidebar, .admin-sidebar").should("exist");
    });

    it("should display dashboard content", () => {
      cy.get(".admin-main-content").should("exist");
      cy.get(".admin-dashboard-main").should("exist");
    });
  });

  describe("Navigation", () => {
    it("should navigate to analytics page", () => {
      cy.visit("/admin-dashboard?page=analytics");
      cy.url().should("include", "page=analytics");
    });

    it("should navigate to complaints page", () => {
      cy.visit("/admin-dashboard?page=complaints");
      cy.url().should("include", "page=complaints");
    });

    it("should navigate to donations page", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.url().should("include", "page=donations");
    });
  });

  describe("Error Handling", () => {
    it("should handle dashboard API error", () => {
      cy.intercept("GET", "**/admin/dashboard/summary", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("dashboardError");

      cy.visit("/admin-dashboard");
      cy.wait("@dashboardError");
      cy.get(".admin-error-state, .error-message").should("exist");
    });
  });
});
