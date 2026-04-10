describe("Reports Page", () => {
  const session = () => ({
    username: "testdonor",
    role: "DONATOR",
    _expiresAt: Date.now() + 3600 * 1000,
  });

  const mockDonations = [
    { _id: "d1", foodType: "veg",    quantity: { amount: 10, unit: "kg" },       lifecycleStatus: "COMPLETED", donorUsername: "testdonor", expiryTime: new Date(Date.now() + 3600000).toISOString() },
    { _id: "d2", foodType: "cooked", quantity: { amount: 5,  unit: "portions" }, lifecycleStatus: "PUBLISHED", donorUsername: "testdonor", expiryTime: new Date(Date.now() + 3600000).toISOString() },
    { _id: "d3", foodType: "bakery", quantity: { amount: 3,  unit: "boxes" },    lifecycleStatus: "DRAFT",     donorUsername: "testdonor", expiryTime: new Date(Date.now() + 3600000).toISOString() },
  ];

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify(session()));
    });
    cy.intercept("GET", "**/api/surplus/mine", { statusCode: 200, body: mockDonations }).as("getDonations");
    cy.intercept("GET", "**/api/food-requests/all", { statusCode: 200, body: { data: [] } }).as("getRequests");
    cy.visit("/reports");
  });

  it("reports page loads correctly", () => {
    cy.wait("@getDonations");
    cy.get(".rp-page").should("exist");
    cy.get(".rp-main").should("be.visible");
  });

  it("shows correct total donation count", () => {
    cy.wait("@getDonations");
    cy.get(".rp-stats-row").should("be.visible");
    cy.get(".rp-stat").first().should("contain", "3");
  });

  it("shows donations by status chart", () => {
    cy.wait("@getDonations");
    cy.get(".rp-card").should("have.length.at.least", 1);
    cy.get(".rp-card__title").first().should("contain", "Status");
  });

  it("shows recent donations table when data exists", () => {
    cy.wait("@getDonations");
    cy.get(".rp-table").should("exist");
    cy.get(".rp-table tbody tr").should("have.length.at.least", 1);
  });

  it("refresh button reloads donations", () => {
    cy.wait("@getDonations");
    cy.intercept("GET", "**/api/surplus/mine", { statusCode: 200, body: mockDonations }).as("refreshDonations");
    cy.contains("Refresh").click();
    cy.wait("@refreshDonations");
    cy.get(".rp-stats-row").should("be.visible");
  });
});
