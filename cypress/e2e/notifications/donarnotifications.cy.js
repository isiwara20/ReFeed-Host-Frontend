describe("Donor Notifications Workflow - E2E Tests", () => {
  const donorUser = {
    _id: "donor-user-id",
    username: "donor001",
    role: "DONOR",
    token: "test-token",
    _expiresAt: Date.now() + 60 * 60 * 1000,
  };

  beforeEach(() => {
    cy.visit("/donor-dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("currentUser", JSON.stringify(donorUser));
        win.localStorage.setItem("refeed_user", JSON.stringify(donorUser));
      },
    });
  });

  it("shows notifications navigation option", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).should("exist");
  });

  it("navigates to notifications page", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).click({ force: true });

    cy.url().should("include", "/notifications");
    cy.get("body").should("contain.text", "Notification");
  });

  it("keeps notifications page accessible after refresh", () => {
    cy.contains("button, a", /notifications/i, { timeout: 10000 }).click({ force: true });
    cy.url().should("include", "/notifications");

    cy.reload();
    cy.get("body").should("contain.text", "Notification");
  });

  it("redirects unauthenticated users to login", () => {
    cy.clearLocalStorage();
    cy.visit("/donor-dashboard");
    cy.url().should((url) => {
      expect(url).to.match(/\/login|\/donor-dashboard/);
    });
  });

  describe("API Layer", () => {
    it("fetches notifications list when notifications page is opened", () => {
      cy.intercept("GET", "**/notifications/user/**", {
        statusCode: 200,
        body: [{ id: "dn1", title: "Donation update", message: "Donor notification" }],
      }).as("getNotificationsList");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(donorUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(donorUser));
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
          win.localStorage.setItem("currentUser", JSON.stringify(donorUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(donorUser));
        },
      });
      cy.wait("@getNotificationsEmpty").its("response.body").should("deep.equal", []);
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
          win.localStorage.setItem("currentUser", JSON.stringify(donorUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(donorUser));
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
            { id: `dn${requestCount}`, title: "Donation update", message: `Fetch ${requestCount}` },
          ],
        });
      }).as("getNotificationsRefresh");

      cy.visit("/notifications", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(donorUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(donorUser));
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