describe("Admin Messages Workflow - E2E Tests", () => {
  const adminUser = {
    username: "admin001",
    role: "ADMIN",
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

  it("shows messages navigation option", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).should("exist");
  });

  it("navigates to messages page from dashboard menu", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).click({ force: true });

    cy.url().should("include", "page=messages");
    cy.get("body").should("contain.text", "Message");
  });

  it("keeps messages route valid after refresh", () => {
    cy.contains("button, a", /messages/i, { timeout: 10000 }).click({ force: true });
    cy.url().should("include", "page=messages");

    cy.reload();
    cy.url().should("include", "admin-dashboard");
  });

  it("redirects unauthenticated users to login", () => {
    cy.clearLocalStorage();
    cy.visit("/admin-dashboard?page=messages");
    cy.url().should("include", "/login");
  });

  describe("API Layer", () => {
    it("fetches messages list when messages page is opened", () => {
      cy.intercept("GET", "**/conversations/users**", {
        statusCode: 200,
        body: [{ username: "ngo001", role: "NGO", name: "NGO User" }],
      }).as("getConversationUsers");
      cy.intercept("GET", "**/conversations*", {
        statusCode: 200,
        body: [],
      }).as("getConversations");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
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
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
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
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });
      cy.wait("@getConversationUsersError").its("response.statusCode").should("eq", 500);
      cy.wait("@getConversationsError").its("response.statusCode").should("eq", 500);
      cy.get("body").should("contain.text", "Internal server error");
    });

    it("refreshes messages and triggers a second fetch", () => {
      cy.intercept("GET", "**/conversations/users**", (req) => {
        req.reply({
          statusCode: 200,
          body: [{ username: "ngo001", role: "NGO", name: "NGO User" }],
        });
      }).as("getConversationUsersRefresh");

      cy.intercept("GET", "**/conversations*", (req) => {
        req.reply({ statusCode: 200, body: [] });
      }).as("getConversationsRefresh");

      cy.visit("/messages", {
        onBeforeLoad(win) {
          win.localStorage.setItem("currentUser", JSON.stringify(adminUser));
          win.localStorage.setItem("refeed_user", JSON.stringify(adminUser));
        },
      });

      cy.wait("@getConversationUsersRefresh");
      cy.wait("@getConversationsRefresh");

      cy.contains("button", /refresh/i).click({ force: true });
      cy.wait("@getConversationUsersRefresh");
      cy.wait("@getConversationsRefresh");

      cy.get("@getConversationUsersRefresh.all").should((all) => {
        expect(all.length).to.be.at.least(2);
      });
      cy.get("@getConversationsRefresh.all").should((all) => {
        expect(all.length).to.be.at.least(2);
      });
    });
  });
});