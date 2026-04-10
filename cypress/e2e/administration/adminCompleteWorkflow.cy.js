describe("Admin Complete Workflow - E2E Tests", () => {
  describe("Login Workflow", () => {
    it("should login successfully with admin credentials", () => {
      cy.intercept("POST", "**/auth/login", {
        statusCode: 200,
        body: { 
          username: "admin001", 
          role: "ADMIN", 
          dashboard: "/admin-dashboard" 
        }
      }).as("login");

      cy.visit("/login");
      cy.get('input[id="username"]').type("admin001");
      cy.get('input[id="password"]').type("AdminPass@123");
      cy.get('button[type="submit"]').click();
      
      cy.wait("@login");
      cy.url().should("include", "/admin-dashboard");
    });
  });

  describe("Dashboard Navigation", () => {
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
    });

    it("should access dashboard", () => {
      cy.visit("/admin-dashboard");
      cy.wait("@getDashboardSummary");
      cy.get(".admin-dashboard").should("exist");
    });

    it("should navigate to analytics page", () => {
      cy.visit("/admin-dashboard?page=analytics");
      cy.wait("@getDashboardSummary");
      cy.get(".analytics-impact-reports").should("exist");
    });

    it("should navigate to complaints page", () => {
      cy.visit("/admin-dashboard?page=complaints");
      cy.wait("@getDashboardSummary");
      cy.get(".admin-complaint-content").should("exist");
    });

    it("should navigate to donations page", () => {
      cy.visit("/admin-dashboard?page=donations");
      cy.wait("@getDashboardSummary");
      cy.get(".donation-oversight").should("exist");
    });

    it("should navigate to profile page", () => {
      cy.visit("/admin-dashboard?page=profile");
      cy.wait("@getDashboardSummary");
      cy.get(".admin-profile").should("exist");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect to login without session", () => {
      cy.window().then((win) => win.localStorage.removeItem("currentUser"));
      cy.visit("/admin-dashboard");
      cy.url().should("include", "/login");
    });
  });
});
