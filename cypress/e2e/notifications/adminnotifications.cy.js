describe("Admin Notifications Workflow - E2E Tests", () => {
  const adminUser = {
    _id: "admin-user-id",
    username: "admin001",
    role: "ADMIN",
    token: "test-token",
    _expiresAt: Date.now() + 60 * 60 * 1000,
  };

  beforeEach(() => {
    cy.visit("/admin-dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
        win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
      },
    });
  });

  it("shows notifications navigation option", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).should("exist");
  });

  it("navigates to notifications page from dashboard menu", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).click({ force: true });

    cy.url().should("include", "page=notifications");
    cy.get("body").should("contain.text", "Notification");
  });

  it("keeps notifications route valid after refresh", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).click({ force: true });
    cy.url().should("include", "page=notifications");

    cy.reload();
    cy.url().should("include", "admin-dashboard");
  });

  it("redirects unauthenticated users to login", () => {
    cy.clearLocalStorage();
    cy.visit("/admin-dashboard?page=notifications");
    cy.url().should("include", "/login");
  });

  describe("API Layer", () => {
    it("fetches notifications list when notifications page is opened", () => {
      cy.intercept("GET", "**/notifications/user/**", {
        statusCode: 200,
        body: [{ id: "n1", title: "System update", message: "Admin notification" }],
      }).as("getNotificationsList");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });
      cy.wait("@getNotificationsList").its("response.statusCode").should("eq", 200);
    });

    it("handles empty notifications response gracefully", () => {
      cy.intercept("GET", "**/notifications/user/**", {
        statusCode: 200,
        body: [],
      }).as("getNotificationsEmpty");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });
      cy.wait("@getNotificationsEmpty").its("response.body").should("deep.equal", []);
      cy.url().should("include", "/notifications");
      cy.get("body").should("not.contain", "undefined");
      cy.get("body").should("contain.text", "No notifications yet");
    });

    it("handles notifications API failure response", () => {
      cy.intercept("GET", "**/notifications/user/**", {
        statusCode: 500,
        body: { message: "Internal server error" },
      }).as("getNotificationsError");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });
      cy.wait("@getNotificationsError").its("response.statusCode").should("eq", 500);
      cy.url().should("include", "/notifications");
      cy.get("body").should("contain.text", "Internal server error");
    });

    it("refreshes notifications and triggers a second fetch", () => {
      let requestCount = 0;

      cy.intercept("GET", "**/notifications/user/**", (req) => {
        requestCount += 1;
        req.reply({
          statusCode: 200,
          body: [
            { id: `n${requestCount}`, title: "System update", message: `Fetch ${requestCount}` },
          ],
        });
      }).as("getNotificationsRefresh");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });

      cy.wait("@getNotificationsRefresh");
        cy.then(() => {
          const countBeforeRefresh = requestCount;
          cy.contains("button", /refresh/i).click({ force: true });
          cy.wait("@getNotificationsRefresh");

          cy.wrap(null).should(() => {
            expect(requestCount).to.be.greaterThan(countBeforeRefresh);
          });
        });
    });
  });

});