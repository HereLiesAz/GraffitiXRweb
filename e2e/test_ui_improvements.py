import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(autouse=True)
def goto_homepage(page: Page):
    """Fixture to navigate to the homepage before each test."""
    page.goto("http://localhost:5173")
    expect(page.get_by_text("GraffitiXR")).to_be_visible()

def test_slider_dialog_functionality(page: Page):
    """
    Tests the complete user flow of the SliderDialog for 'Opacity'.
    """
    # 1. Open the dialog
    page.get_by_text("Opacity").click()
    slider_dialog = page.locator(".slider-dialog")
    expect(slider_dialog).to_be_visible()
    expect(slider_dialog.get_by_text("Opacity")).to_be_visible()
    page.screenshot(path="e2e/screenshots/01-slider-dialog-opened.png")

    # 2. Test the slider's reset functionality
    slider = slider_dialog.locator('input[type="range"]')
    initial_value = "1"
    test_value = "0.2"

    expect(slider).to_have_value(initial_value)
    slider.fill(test_value)
    expect(slider).to_have_value(test_value)

    reset_button = slider_dialog.get_by_role("button", name="Reset")
    reset_button.click()
    expect(slider).to_have_value(initial_value)

    # 3. Close the dialog
    close_button = slider_dialog.get_by_role("button", name="Done")
    close_button.click()
    expect(slider_dialog).not_to_be_visible()

def test_notification_display(page: Page):
    """
    Tests that a notification appears after an action and then disappears.
    """
    # 1. Trigger the notification
    page.get_by_text("Capture Marks").click()

    # 2. Verify the notification appears with the correct content
    notification = page.locator(".notification")
    expect(notification).to_be_visible()
    expect(notification).to_contain_text("keypoints captured")
    page.screenshot(path="e2e/screenshots/02-notification-visible.png")

    # 3. Verify the notification disappears automatically
    expect(notification).not_to_be_visible(timeout=5000)