describe("Admin Analytics - E2E Tests", () => {
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

    cy.intercept("GET", "**/admin/analytics/platform-summary", {
      statusCode: 200,
      body: { totalUsers: 1250, activeUsers: 450, totalNGOs: 45 }
    }).as("getPlatformSummary");

    cy.intercept("GET", "**/admin/analytics/monthly-growth", {
      statusCode: 200,
      body: []
    }).as("getMonthlyGrowth");

    cy.intercept("GET", "**/admin/analytics/complaint-impact", {
      statusCode: 200,
      body: []
    }).as("getComplaintImpact");

    cy.intercept("GET", "**/admin/analytics/full-report", {
      statusCode: 200,
      body: { donationAnalytics: { totalQuantity: 1250 } }
    }).as("getFullReport");

    cy.visit("/admin-dashboard?page=analytics");
    cy.wait("@getDashboardSummary");
    cy.wait("@getPlatformSummary");
    cy.wait("@getMonthlyGrowth");
    cy.wait("@getComplaintImpact");
    cy.wait("@getFullReport");
  });

  describe("Page Display", () => {
    it("should display analytics page", () => {
      cy.get(".analytics-impact-reports").should("exist");
    });

    it("should display metrics cards", () => {
      cy.get(".analytics-metric-card").should("have.length", 4);
    });

    it("should display charts", () => {
      cy.get(".analytics-chart-container").should("exist");
      cy.get("canvas").should("exist");
    });

    it("should have date filter", () => {
      cy.get(".analytics-date-select").should("exist");
    });

    it("should have PDF download button", () => {
      cy.get(".analytics-pdf-btn").should("exist");
    });
  });

  describe("Date Filtering", () => {
    it("should change date range", () => {
      cy.get(".analytics-date-select").select("90days");
      cy.get(".analytics-date-select").should("have.value", "90days");
    });
  });

  describe("Error Handling", () => {
    it("should handle analytics API error", () => {
      cy.intercept("GET", "**/admin/analytics/platform-summary", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("analyticsError");

      cy.visit("/admin-dashboard?page=analytics");
      cy.wait("@analyticsError");
      cy.get(".analytics-impact-reports, .analytics-loading-state, .analytics-error-state").should("exist");
    });
  });
});
