describe("NGO Messages Workflow - E2E Tests", () => {
  const ngoUser = {
    username: "ngo001",
    role: "NGO",
    _expiresAt: Date.now() + 60 * 60 * 1000,
  };

  beforeEach(() => {
    cy.visit("/ngo-dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("currentUser", JSON.stringify(ngoUser));
        win.localStorage.setItem("refeed_user", JSON.stringify(ngoUser));
      },
    });
  });

  it("shows messages navigation option", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).should("be.visible");
  });

  it("navigates to messages page", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).click({ force: true });

    cy.url().should("include", "/ngo-dashboard");
    cy.get("body").should("contain.text", "Message");
  });

  it("keeps messages section accessible after refresh", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).click({ force: true });
    cy.reload();
    cy.url().should("include", "/ngo-dashboard");
  });

  it("redirects unauthenticated users to login", () => {
    cy.clearLocalStorage();
    cy.visit("/ngo-dashboard");
    cy.url().should("include", "/login");
  });

  describe("API Layer", () => {
    it("fetches messages list when messages section is opened", () => {
      cy.intercept("GET", "**/conversations/users**", {
        statusCode: 200,
        body: [{ username: "donor001", role: "DONOR", name: "Donor User" }],
      }).as("getConversationUsers");
      cy.intercept("GET", "**/conversations*", {
        statusCode: 200,
        body: [],
      }).as("getConversations");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(ngoUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(ngoUser));
        },
      });
      cy.wait("@getConversationUsers").its("response.statusCode").should("eq", 200);
      cy.wait("@getConversations").its("response.statusCode").should("eq", 200);
    });

    it("handles empty messages response gracefully", () => {
      cy.intercept("GET", "**/conversations/users**", {
        statusCode: 200,
        body: [],
      }).as("getConversationUsersEmpty");
      cy.intercept("GET", "**/conversations*", {
        statusCode: 200,
        body: [],
      }).as("getConversationsEmpty");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(ngoUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(ngoUser));
        },
      });
      cy.wait("@getConversationUsersEmpty").its("response.body").should("deep.equal", []);
      cy.wait("@getConversationsEmpty").its("response.body").should("deep.equal", []);
      cy.get("body").should("not.contain", "undefined");
      cy.get("body").should("contain.text", "No contacts found");
      cy.get("body").should("contain.text", "No conversations found");
    });

    it("handles messages API failure response", () => {
      cy.intercept("GET", "**/conversations/users**", {
        statusCode: 500,
        body: { message: "Internal server error" },
      }).as("getConversationUsersError");
      cy.intercept("GET", "**/conversations*", {
        statusCode: 500,
        body: { message: "Internal server error" },
      }).as("getConversationsError");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(ngoUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(ngoUser));
        },
      });
      cy.wait("@getConversationUsersError").its("response.statusCode").should("eq", 500);
      cy.wait("@getConversationsError").its("response.statusCode").should("eq", 500);
      cy.get("body").should("contain.text", "Internal server error");
    });

    it("refreshes messages and triggers a second fetch", () => {
      let usersRequestCount = 0;
      let conversationsRequestCount = 0;

      cy.intercept("GET", "**/conversations/users**", (req) => {
        usersRequestCount += 1;
        req.reply({
          statusCode: 200,
          body: [{ username: "donor001", role: "DONOR", name: "Donor User" }],
        });
      }).as("getConversationUsersRefresh");

      cy.intercept("GET", "**/conversations*", (req) => {
        conversationsRequestCount += 1;
        req.reply({ statusCode: 200, body: [] });
      }).as("getConversationsRefresh");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(ngoUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(ngoUser));
        },
      });

      cy.wait("@getConversationUsersRefresh");
      cy.wait("@getConversationsRefresh");

      cy.then(() => {
        const usersBeforeRefresh = usersRequestCount;
        const conversationsBeforeRefresh = conversationsRequestCount;

        cy.contains("button", /refresh/i).click({ force: true });
        cy.wait("@getConversationUsersRefresh");
        cy.wait("@getConversationsRefresh");

        cy.wrap(null).should(() => {
          expect(usersRequestCount).to.be.greaterThan(usersBeforeRefresh);
          expect(conversationsRequestCount).to.be.greaterThan(conversationsBeforeRefresh);
        });
      });
    });
  });
});