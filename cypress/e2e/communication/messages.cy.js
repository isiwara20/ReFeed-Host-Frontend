describe("NGO Messages - E2E Tests", () => {
  const sessionUser = {
    _id: "ngo-user-1",
    id: "ngo-user-1",
    userId: "ngo-user-1",
    username: "AAA20265600",
    role: "NGO",
    token: "fake-token",
    _expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const conversation = {
    _id: "conv-1",
    otherParticipant: {
      username: "donor01",
      role: "DONOR",
      name: "Donor One",
    },
    unreadCount: 1,
    lastMessage: {
      _id: "m2",
      body: "Need pickup at 5pm",
    },
  };

  const baseMessages = [
    {
      _id: "m1",
      body: "Can you accept this donation today?",
      senderUsername: "donor01",
      senderRole: "DONOR",
      createdAt: "2026-04-04T08:00:00.000Z",
    },
    {
      _id: "m2",
      body: "Need pickup at 5pm",
      senderUsername: "AAA20265600",
      senderRole: "NGO",
      createdAt: "2026-04-04T08:10:00.000Z",
    },
  ];

  const seedSessionAndVisit = (path = "/messages?conversationId=conv-1") => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      },
    });
  };

  beforeEach(() => {
    cy.intercept("GET", "**/conversations/users", {
      statusCode: 200,
      body: [
        {
          username: "donor01",
          role: "DONOR",
          name: "Donor One",
        },
      ],
    }).as("getUsers");

    cy.intercept("GET", "**/conversations", {
      statusCode: 200,
      body: [conversation],
    }).as("getConversations");

    cy.intercept("GET", "**/conversations/conv-1/messages", {
      statusCode: 200,
      body: { messages: baseMessages },
    }).as("getMessages");

    cy.intercept("PATCH", "**/conversations/conv-1/read", {
      statusCode: 200,
      body: { success: true },
    }).as("markConversationRead");

    cy.intercept("POST", "**/conversations/conv-1/messages", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          _id: "m-new",
          body: req.body.body,
          senderUsername: "AAA20265600",
          senderRole: "NGO",
          createdAt: "2026-04-04T09:00:00.000Z",
        },
      });
    }).as("sendMessage");

    cy.intercept("PATCH", "**/conversations/conv-1/messages/m2", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          _id: "m2",
          body: req.body.body,
          senderUsername: "AAA20265600",
          senderRole: "NGO",
          createdAt: "2026-04-04T08:10:00.000Z",
          editedAt: "2026-04-04T09:05:00.000Z",
        },
      });
    }).as("editMessage");

    cy.intercept("DELETE", "**/conversations/conv-1/messages/m2", {
      statusCode: 200,
      body: { success: true },
    }).as("deleteMessage");
  });

  it("should load messages and send a new message", () => {
    seedSessionAndVisit();
    cy.wait("@getUsers");
    cy.wait("@getConversations");
    cy.wait("@getMessages");

    cy.contains("h1", "Messages").should("be.visible");
    cy.contains("Can you accept this donation today?").should("be.visible");

    cy.get("textarea.rf-composer-input").type("Pickup confirmed for 5pm.");
    cy.contains("button", "Send message").click();

    cy.wait("@sendMessage");
    cy.contains("Pickup confirmed for 5pm.").should("be.visible");
  });

  it("should edit and delete an own message", () => {
    seedSessionAndVisit();
    cy.wait("@getMessages");

    cy.contains(".rf-message-bubble", "Need pickup at 5pm").within(() => {
      cy.get('button[aria-label="Open message actions"]').click();
    });

    cy.contains("button", "Edit message").click();
    cy.get("textarea.rf-message-edit-input").clear().type("Need pickup at 6pm");
    cy.contains("button", "Save").click();

    cy.wait("@editMessage");
    cy.contains("Need pickup at 6pm").should("be.visible");
    cy.contains("(edited)").should("be.visible");

    cy.contains(".rf-message-bubble", "Need pickup at 6pm").within(() => {
      cy.get('button[aria-label="Open message actions"]').click();
    });

    cy.contains("button", "Delete message").click();
    cy.contains("button", "Delete").click();

    cy.wait("@deleteMessage");
    cy.contains("Need pickup at 6pm").should("not.exist");
  });
});
