describe("Admin Profile - E2E Tests", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "admin001",
        role: "ADMIN",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });

    cy.intercept("GET", "**/admin/profile/admin001", {
      statusCode: 200,
      body: {
        username: "admin001",
        name: "System Admin",
        email: "admin@refeed.lk",
        phone: "+94771234567",
        profile: {
          profilepic: null,
          nic: "123456789V",
          gender: "Male",
          bio: "System Administrator"
        }
      }
    }).as("getProfile");

    cy.visit("/admin-dashboard?page=profile");
    cy.wait("@getProfile");
  });

  describe("Page Display", () => {
    it("should display profile page", () => {
      cy.get(".admin-profile-content").should("exist");
    });

    it("should display user information", () => {
      cy.get(".admin-profile-content").should("contain", "admin001");
      cy.get(".admin-profile-content").should("contain", "System Admin");
    });

    it("should have profile form", () => {
      cy.get(".admin-profile-form").should("exist");
      cy.get('input[type="text"], input[type="email"]').should("exist");
    });

    it("should have edit button", () => {
      cy.get(".admin-edit-btn").should("exist");
      cy.get(".admin-edit-btn").should("contain", "Edit Profile");
    });
  });

  describe("Form Interaction", () => {
    it("should enable editing when edit button clicked", () => {
      cy.get(".admin-edit-btn").click();
      cy.get(".admin-btn-primary").should("exist");
      cy.get(".admin-btn-back").should("contain", "Cancel");
    });

    it("should show form fields in edit mode", () => {
      cy.get(".admin-edit-btn").click();
      cy.get('input[name="name"]').should("exist");
      cy.get('input[name="email"]').should("exist");
      cy.get('input[name="phone"]').should("exist");
    });

    it("should cancel editing", () => {
      cy.get(".admin-edit-btn").click();
      cy.get(".admin-btn-back").click();
      cy.get(".admin-edit-btn").should("exist");
    });
  });

  describe("Error Handling", () => {
    it("should handle profile API error", () => {
      cy.intercept("GET", "**/admin/profile/admin001", {
        statusCode: 500,
        body: { message: "Internal server error" }
      }).as("profileError");

      cy.visit("/admin-dashboard?page=profile");
      cy.wait("@profileError");
      cy.get(".admin-profile-loading, .admin-profile-content").should("exist");
    });
  });
});
