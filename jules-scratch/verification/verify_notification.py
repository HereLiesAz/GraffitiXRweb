import time
from playwright.sync_api import Page, expect

def test_notification_feedback(page: Page):
    """
    This test verifies that the new notification system provides feedback
    after capturing marks.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

    # 2. Act: Click the "Capture Marks" button.
    page.get_by_text("Capture Marks").click()

    # 3. Assert: Verify that the notification is visible and take a screenshot.
    notification = page.locator(".notification")
    expect(notification).to_be_visible()
    expect(notification).to_contain_text("keypoints captured")
    page.screenshot(path="jules-scratch/verification/01-notification.png")

    # 4. Assert: Wait for the notification to disappear.
    expect(notification).not_to_be_visible(timeout=5000)
    page.screenshot(path="jules-scratch/verification/02-notification-gone.png")