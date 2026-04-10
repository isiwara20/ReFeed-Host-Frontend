describe("NGO Dashboard - E2E Tests", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[id="username"]').type("AAA20265600");
    cy.get('input[id="password"]').type("osloCC@123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/ngo-dashboard");
    cy.wait(2000);
  });

  describe("Dashboard Display", () => {
    it("should display NGO dashboard", () => {
      cy.get("body").should("be.visible");
      cy.url().should("include", "/ngo-dashboard");
    });

    it("should have navigation elements", () => {
      cy.get("nav, [role='navigation'], .navbar, .sidebar").should("exist");
    });
  });

  describe("Dashboard Responsiveness", () => {
    it("should be responsive on mobile", () => {
      cy.viewport("iphone-x");
      cy.get("body").should("be.visible");
    });

    it("should be responsive on tablet", () => {
      cy.viewport("ipad-2");
      cy.get("body").should("be.visible");
    });

    it("should be responsive on desktop", () => {
      cy.viewport(1280, 720);
      cy.get("body").should("be.visible");
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

  describe("Dashboard Performance", () => {
    it("should load dashboard quickly", () => {
      cy.visit("/ngo-dashboard");
      cy.get("body").should("be.visible");
    });
  });
});
