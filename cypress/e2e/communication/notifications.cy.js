describe("NGO Notifications - E2E Tests", () => {
  const sessionUser = {
    _id: "ngo-user-1",
    id: "ngo-user-1",
    userId: "ngo-user-1",
    username: "AAA20265600",
    role: "NGO",
    token: "fake-token",
    _expiresAt: Date.now() + 60 * 60 * 1000,
  };

  const allNotifications = [
    {
      _id: "n1",
      title: "New message",
      message: "You have a new donor message",
      isRead: false,
      metadata: { conversationId: "conv-1" },
      createdAt: "2026-04-04T10:00:00.000Z",
    },
    {
      _id: "n2",
      title: "Profile updated",
      message: "Your NGO profile was updated",
      isRead: true,
      createdAt: "2026-04-03T09:00:00.000Z",
    },
  ];

  const unreadNotifications = allNotifications.filter((n) => !n.isRead);

  const seedSessionAndVisit = (path = "/notifications") => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      },
    });
  };

  beforeEach(() => {
    cy.intercept("GET", "**/notifications/user/ngo-user-1*", (req) => {
      const unreadOnly = req.url.includes("unreadOnly=true");
      req.reply({
        notifications: unreadOnly ? unreadNotifications : allNotifications,
        unreadCount: unreadNotifications.length,
        pagination: { hasMore: false },
      });
    }).as("getNotifications");

    cy.intercept("PATCH", "**/notifications/read-all", {
      statusCode: 200,
      body: { success: true },
    }).as("markAllRead");

    cy.intercept("PATCH", "**/notifications/*/read", {
      statusCode: 200,
      body: { success: true },
    }).as("markRead");
  });

  it("should render notification center and mark all as read", () => {
    seedSessionAndVisit();
    cy.wait("@getNotifications");

    cy.contains("Notification Center").should("be.visible");
    cy.contains("1 unread notification").should("be.visible");
    cy.contains("New message").should("be.visible");
    cy.contains("Profile updated").should("be.visible");

    cy.contains("button", "Mark all as read (1)").click();
    cy.wait("@markAllRead");
    cy.contains("0 unread notifications").should("be.visible");
  });

  it("should filter to unread notifications", () => {
    seedSessionAndVisit();
    cy.wait("@getNotifications");

    cy.contains("a", "Unread").click();
    cy.url().should("include", "/notifications?filter=unread");
    cy.wait("@getNotifications");

    cy.contains("New message").should("be.visible");
    cy.contains("Profile updated").should("not.exist");
  });

  it("should open conversation from a notification", () => {
    seedSessionAndVisit();
    cy.wait("@getNotifications");

    cy.contains("button", "Open conversation").click();
    cy.wait("@markRead");
    cy.url().should("include", "/messages?conversationId=conv-1");
  });
});
