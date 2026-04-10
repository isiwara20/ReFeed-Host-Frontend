describe("NGO Complete Workflow - E2E Tests", () => {
  describe("Login Workflow", () => {
    it("should login successfully with valid credentials", () => {
      cy.visit("/login");
      cy.get('input[id="username"]').type("AAA20265600");
      cy.get('input[id="password"]').type("osloCC@123");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/ngo-dashboard");
    });
  });

  describe("Dashboard Access", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.get('input[id="username"]').type("AAA20265600");
      cy.get('input[id="password"]').type("osloCC@123");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/ngo-dashboard");
      cy.wait(2000);
    });

    it("should display dashboard after login", () => {
      cy.get("body").should("be.visible");
      cy.url().should("include", "/ngo-dashboard");
    });

    it("should have navigation elements", () => {
      cy.get("nav, [role='navigation'], .navbar, .sidebar").should("exist");
    });

    it("should maintain session on reload", () => {
      cy.reload();
      cy.url().should("include", "/ngo-dashboard");
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.get('input[id="username"]').type("AAA20265600");
      cy.get('input[id="password"]').type("osloCC@123");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/ngo-dashboard");
      cy.wait(2000);
    });

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

  describe("Registration Page", () => {
    it("should display registration page", () => {
      cy.visit("/register");
      cy.get("body").should("be.visible");
      cy.url().should("include", "/register");
    });
  });

  describe("Password Reset Page", () => {
    it("should display forgot password page", () => {
      cy.visit("/forgot-password");
      cy.get("body").should("be.visible");
      cy.url().should("include", "/forgot-password");
    });

    it("should have link to login", () => {
      cy.visit("/forgot-password");
      cy.get("a").contains(/login|back/i).should("be.visible");
    });
  });
});
