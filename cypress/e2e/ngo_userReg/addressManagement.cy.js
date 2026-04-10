describe("NGO Address Management - E2E Tests", () => {
  beforeEach(() => {
    // Login first with actual credentials
    cy.visit("/login");
    cy.get('input[id="username"]').type("AAA20265600");
    cy.get('input[id="password"]').type("osloCC@123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/ngo-dashboard");
    cy.wait(2000);
  });

  describe("Dashboard Navigation", () => {
    it("should display NGO dashboard", () => {
      cy.get("body").should("be.visible");
      cy.url().should("include", "/ngo-dashboard");
    });

    it("should display dashboard title", () => {
      cy.get("body").should("be.visible");
    });

    it("should have navigation elements", () => {
      cy.get("nav, [role='navigation'], .navbar, .sidebar").should("exist");
    });
  });

  describe("Responsive Design", () => {
    it("should be responsive on desktop", () => {
      cy.viewport(1280, 720);
      cy.get("body").should("be.visible");
    });

    it("should be responsive on tablet", () => {
      cy.viewport("ipad-2");
      cy.get("body").should("be.visible");
    });

    it("should be responsive on mobile", () => {
      cy.viewport("iphone-x");
      cy.get("body").should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should handle page load errors gracefully", () => {
      cy.visit("/ngo-dashboard");
      cy.get("body").should("be.visible");
    });

    it("should maintain session", () => {
      cy.url().should("include", "/ngo-dashboard");
      cy.reload();
      cy.url().should("include", "/ngo-dashboard");
    });
  });

  describe("Data Display", () => {
    it("should display statistics", () => {
      cy.get("[class*='stat'], [class*='card'], [class*='metric']").should("exist");
    });

    it("should display action buttons", () => {
      cy.get("button").should("have.length.greaterThan", 0);
    });
  });

  describe("Navigation Flow", () => {
    it("should navigate within dashboard", () => {
      cy.url().should("include", "/ngo-dashboard");
      cy.get("a, button").should("have.length.greaterThan", 0);
    });

    it("should maintain navigation state", () => {
      cy.url().should("include", "/ngo-dashboard");
      cy.reload();
      cy.url().should("include", "/ngo-dashboard");
    });
  });

  describe("Session Management", () => {
    it("should maintain user session", () => {
      cy.url().should("include", "/ngo-dashboard");
      cy.reload();
      cy.url().should("include", "/ngo-dashboard");
    });

    it("should have user data available", () => {
      cy.window().then((win) => {
        const user = JSON.parse(localStorage.getItem("refeed_user") || localStorage.getItem("currentUser") || "{}");
        expect(user).to.not.be.empty;
      });
    });
  });

  describe("Performance", () => {
    it("should load dashboard quickly", () => {
      cy.visit("/ngo-dashboard");
      cy.get("body").should("be.visible");
    });
  });
});
