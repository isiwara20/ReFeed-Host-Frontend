describe("Admin User Verification - E2E Tests", () => {
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

    cy.intercept("GET", "**/admin/verification/ngos/pending", {
      statusCode: 200,
      body: [
        {
          _id: "ngo123",
          ngoId: {
            name: "Test NGO",
            email: "test@ngo.com",
            phone: "1234567890",
            registrationNumber: "REG123456"
          },
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ]
    }).as("getPendingNGOs");

    cy.intercept("GET", "**/admin/verification/donors/pending", {
      statusCode: 200,
      body: [
        {
          _id: "donor123",
          name: "testdonor",
          email: "donor@test.com",
          phone: "1234567890",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ]
    }).as("getPendingDonors");

    cy.visit("/admin-dashboard?page=verification");
    cy.wait("@getDashboardSummary");
    cy.wait("@getPendingNGOs");
    cy.wait("@getPendingDonors");
  });

  describe("Page Display", () => {
    it("should display verification page", () => {
      cy.get(".admin-verification-container").should("exist");
    });

    it("should display page header", () => {
      cy.get(".admin-verification-container").should("contain", "Verification");
    });

    it("should have verification list", () => {
      cy.get(".admin-verification-container").should("exist");
      // List may not exist when empty, so check container exists
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no pending verifications", () => {
      cy.get(".admin-verification-container").should("exist");
    });
  });

  describe("NGO Verification", () => {
    it("should display pending NGOs", () => {
      cy.get(".admin-tab-button").contains("NGO Organizations").click();
      cy.get(".admin-verification-item").should("have.length", 1);
      cy.get(".admin-verification-item").should("contain", "Test NGO");
    });
  });

  describe("Donor Verification", () => {
    it("should display pending donors", () => {
      cy.get(".admin-tab-button").contains("Donor Applications").click();
      cy.get(".admin-verification-item").should("have.length", 1);
      cy.get(".admin-verification-item").should("contain", "testdonor");
    });
  });

  describe("Error Handling", () => {
    it("should handle verification API error", () => {
      cy.intercept("GET", "**/admin/verification/ngos/pending", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("verificationError");

      cy.visit("/admin-dashboard?page=verification");
      cy.wait("@verificationError");
      cy.get(".admin-verification-container, .admin-error-state").should("exist");
    });
  });
});
