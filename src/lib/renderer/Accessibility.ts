/**
 *
 * see: https://www.w3.org/TR/wai-aria-1.1/
 */
export const enableAccessibilityFeatures = () => {
    // look for the message content container and mark it as dynamic
    const contentContainers = document.getElementsByClassName("lto-content");
    if (contentContainers.length > 1) {
        console.warn("There are more than one 'lto-content' containers in the DOM but there should only be one (using the first one for accessibility features)");
    }
    if (contentContainers.length === 0) {
        console.error("No 'lto-content' container found in DOM");
        throw Error("No 'lto-content' container present in DOM");
    }
    contentContainers[0].setAttribute("aria-live", "polite");
    contentContainers[0].setAttribute("aria-label", "chat-bot-message-area");
    contentContainers[0].setAttribute("aria-description", "Area where new chat-bot messages appear");
    contentContainers[0].setAttribute("aria-atomic", "true");
    contentContainers[0].setAttribute("role", "log");

    console.log("Accessibility features are ENABLED");
};

export const ACCESSIBILITY_DEFAULT_TAB_INDEX = 0;
