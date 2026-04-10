describe("Donation Management Flow", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify({
        username: "testdonor",
        role: "DONATOR",
        _expiresAt: Date.now() + 3600 * 1000,
      }));
    });
  });

  it("donor profile page loads", () => {
    cy.intercept("GET", "/api/profile/testdonor", {
      statusCode: 200,
      body: {
        data: {
          username: "testdonor",
          name: "Test Donor",
          email: "test@refeed.lk",
          phone: "0771234567",
          verificationStatus: "PENDING",
        },
      },
    }).as("getProfile");

    cy.visit("/donor-profile");
    cy.get(".dpp-page").should("exist");
  });

  it("create donor profile form is accessible", () => {
    cy.intercept("GET", "/api/profile/testdonor", { statusCode: 404 }).as("noProfile");
    cy.visit("/create-donor");
    cy.get("form").should("exist");
  });

  it("shows validation error on empty profile submit", () => {
    cy.intercept("GET", "/api/profile/testdonor", { statusCode: 404 });
    cy.visit("/create-donor");
    cy.get('button[type="submit"]').click();
    cy.contains("required").should("be.visible");
  });

  it("donator dashboard shows stats", () => {
    cy.intercept("GET", "**/api/surplus/mine", {
      statusCode: 200,
      body: [
        {
          _id: "d1",
          foodType: "veg",
          quantity: { amount: 10, unit: "kg" },
          lifecycleStatus: "COMPLETED",
          donorUsername: "testdonor",
          expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
        {
          _id: "d2",
          foodType: "cooked",
          quantity: { amount: 5, unit: "portions" },
          lifecycleStatus: "DRAFT",
          donorUsername: "testdonor",
          expiryTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      ],
    }).as("getDonations");

    cy.intercept("GET", "**/api/restaurant/mine", { statusCode: 404 });

    cy.visit("/donator-dashboard");
    cy.wait("@getDonations");
    cy.get(".dd-stat__value").first().should("not.contain", "0");
  });

  it("protected route redirects to login without session", () => {
    cy.window().then((win) => win.localStorage.removeItem("currentUser"));
    cy.visit("/donator-dashboard");
    cy.url().should("include", "/login");
  });

  it("surplus complete page shows success on valid id", () => {
    cy.intercept("POST", "**/api/surplus/test-id/complete", {
      statusCode: 200,
      body: { lifecycleStatus: "COMPLETED" },
    }).as("complete");

    cy.visit("/surplus/complete/test-id");
    cy.wait("@complete");
    cy.contains("Completed").should("be.visible");
  });
});
