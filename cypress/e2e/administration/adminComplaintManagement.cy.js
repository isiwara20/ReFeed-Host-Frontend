describe("Admin Complaint Management - E2E Tests", () => {
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

    cy.intercept("GET", "**/complaints?*", {
      statusCode: 200,
      body: []
    }).as("getComplaints");

    cy.intercept("GET", "**/complaints/analytics", {
      statusCode: 200,
      body: { total: 0, open: 0, resolved: 0 }
    }).as("getComplaintAnalytics");

    cy.visit("/admin-dashboard?page=complaints");
    cy.wait("@getDashboardSummary");
    cy.wait("@getComplaints");
    cy.wait("@getComplaintAnalytics");
  });

  describe("Page Display", () => {
    it("should display complaints page", () => {
      cy.get(".admin-complaint-content").should("exist");
    });

    it("should display page header", () => {
      cy.get(".admin-page-title").should("contain", "Incident, Abuse & Complaint Management");
    });

    it("should display statistics cards", () => {
      cy.get(".admin-complaint-stats-grid").should("exist");
      cy.get(".admin-complaint-stat-card").should("have.length", 4);
    });

    it("should display filters", () => {
      cy.visit("/admin-dashboard?page=complaints");
      cy.get(".admin-filter-select").should("have.length", 3);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no complaints", () => {
      cy.visit("/admin-dashboard?page=complaints");
      cy.get(".admin-complaints-list").should("exist");
    });
  });

  describe("Error Handling", () => {
    it("should handle API error gracefully", () => {
      cy.intercept("GET", "**/complaints?*", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("fetchError");

      cy.visit("/admin-dashboard?page=complaints");
      cy.wait("@fetchError");
      cy.get(".admin-error-state").should("be.visible");
    });
  });
});
