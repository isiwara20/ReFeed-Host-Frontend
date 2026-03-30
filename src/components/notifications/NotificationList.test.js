import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationList from "./NotificationList";

const baseNotification = {
  _id: "notif-1",
  subject: "Test notification",
  message: "Body text",
  createdAt: new Date().toISOString()
};

describe("NotificationList", () => {
  test("renders notifications and calls onMarkRead for unread item", () => {
    const onMarkRead = jest.fn();
    const notifications = [
      { ...baseNotification, _id: "n1", isRead: false },
      { ...baseNotification, _id: "n2", isRead: true }
    ];

    render(
      <NotificationList
        notifications={notifications}
        loading={false}
        error={null}
        onMarkRead={onMarkRead}
        onMarkAllRead={jest.fn()}
      />
    );

    // Unread item should show the "Mark read" button
    const markReadButtons = screen.getAllByRole("button", {
      name: /mark read/i
    });
    expect(markReadButtons).toHaveLength(1);

    fireEvent.click(markReadButtons[0]);
    expect(onMarkRead).toHaveBeenCalledTimes(1);
    expect(onMarkRead).toHaveBeenCalledWith("n1");
  });

  test("shows 'Mark all as read' when there are notifications", () => {
    const onMarkAllRead = jest.fn();
    const notifications = [{ ...baseNotification, _id: "n1", isRead: false }];

    render(
      <NotificationList
        notifications={notifications}
        loading={false}
        error={null}
        onMarkRead={jest.fn()}
        onMarkAllRead={onMarkAllRead}
      />
    );

    const markAllButton = screen.getByRole("button", {
      name: /mark all as read/i
    });
    fireEvent.click(markAllButton);
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });
});

