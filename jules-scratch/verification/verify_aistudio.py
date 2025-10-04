from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    # Assuming the server is on 5174, will check logs if this fails
    page.goto("http://localhost:5174")

    # Click the "AI Studio" tab
    page.get_by_role("tab", name="AI Studio").click()

    # Wait for the image generation text field to be visible by its placeholder
    page.get_by_placeholder("Describe the image you want to generate...").wait_for()

    # Find the "Train Style Model" heading and scroll it into view
    train_style_heading = page.get_by_role("heading", name="Train Style Model")
    train_style_heading.scroll_into_view_if_needed()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)