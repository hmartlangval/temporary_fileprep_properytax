// const { ElementHandle, Locator } = require('playwright');

async function waitUntilElementIsFound(page, elementSelectorStr, timeout = null, iterationSpeed = 2) {
    /**
     * Wait until an element matching the selector is found on the page.
     * 
     * @param {object} page - The Playwright page object
     * @param {string} elementSelectorStr - CSS selector for the element to find
     * @param {number|null} timeout - Maximum time to wait for the element in milliseconds, or null for no timeout
     * @param {number} iterationSpeed - The speed in seconds at which the while loop delays between iterations, default is 2 seconds
     * 
     * @returns {Promise<[ElementHandle, Locator]>} A tuple containing (elementHandle, locator) or (null, null) if timeout occurs
     */
    try {
        const startTime = Date.now();

        // Define an inner recursive function to search in frames
        async function findInFrame(frame = null) {
            const currentFrame = frame || page;
            try {
                // Try to find the element without waiting
                const element = await currentFrame.$(elementSelectorStr);
                if (element) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        console.log(`Element found in ${frame ? 'iframe' : 'main document'}: ${elementSelectorStr}`);
                        // Create a locator for the same element
                        const locator = currentFrame.locator(elementSelectorStr);
                        return [element, locator];
                    }
                }
            } catch (error) {
                console.log(`Error checking for element in ${frame ? 'iframe' : 'main document'}`);
            }

            // Check if the frame has child frames
            if (currentFrame.frames) {
                // Recursively search in child frames
                for (const childFrame of currentFrame.frames()) {
                    const result = await findInFrame(childFrame);
                    if (result) {
                        return result;
                    }
                }
            }

            return null;
        }

        // Keep searching until the element is found or timeout is reached
        while (true) {
            console.log(`Searching for element: ${elementSelectorStr}`);

            // Start the search from the main document
            const result = await findInFrame();

            if (result !== null) {
                return result;
            }

            // Check if timeout is set and exceeded
            if (timeout !== null && (Date.now() - startTime) > timeout) {
                console.log(`Timeout reached while waiting for element: ${elementSelectorStr}`);
                return [null, null];
            }

            // If element not found, wait for the specified iteration speed and try again
            console.log(`Element not found, waiting ${iterationSpeed} seconds before trying again...`);
            await new Promise(resolve => setTimeout(resolve, iterationSpeed * 1000));
        }
    } catch (error) {
        console.log(`Error waiting for element '${elementSelectorStr}': ${error}`);
        return [null, null];
    }
}

async function waitUntilElementIsFoundWithFrameLocator(page, elementSelectorStr, timeout = null, iterationSpeed = 2) {
    /**
     * Wait until an element matching the selector is found on the page.
     * 
     * @param {object} page - The Playwright page object
     * @param {string} elementSelectorStr - CSS selector for the element to find
     * @param {number|null} timeout - Maximum time to wait for the element in milliseconds, or null for no timeout
     * @param {number} iterationSpeed - The speed in seconds at which the while loop delays between iterations, default is 2 seconds
     * 
     * @returns {Promise<[ElementHandle, Locator]>} A tuple containing (elementHandle, locator) or (null, null) if timeout occurs
     */
    try {
        const startTime = Date.now();

        // Define an inner recursive function to search in frames
        async function findInFrame(frame = null) {
            const currentFrame = frame || page;
            try {
                // Try to find the element without waiting
                const element = await currentFrame.$(elementSelectorStr);
                if (element) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        console.log(`Element found in ${frame ? 'iframe' : 'main document'}: ${elementSelectorStr}`);
                        // Create a locator for the same element
                        const locator = frame ? page.frameLocator(`iframe[src="${frame.url()}"]`).locator(elementSelectorStr) : currentFrame.locator(elementSelectorStr);
                        return [element, locator];
                    }
                }
            } catch (error) {
                console.log(`Error checking for element in ${frame ? 'iframe' : 'main document'}`);
            }

            // Check if the frame has child frames
            if (currentFrame.frames) {
                // Recursively search in child frames
                for (const childFrame of currentFrame.frames()) {
                    const result = await findInFrame(childFrame);
                    if (result) {
                        return result;
                    }
                }
            }

            return null;
        }

        // Keep searching until the element is found or timeout is reached
        while (true) {
            console.log(`Searching for element: ${elementSelectorStr}`);

            // Start the search from the main document
            const result = await findInFrame();

            if (result !== null) {
                return result;
            }

            // Check if timeout is set and exceeded
            if (timeout !== null && (Date.now() - startTime) > timeout) {
                console.log(`Timeout reached while waiting for element: ${elementSelectorStr}`);
                return [null, null];
            }

            // If element not found, wait for the specified iteration speed and try again
            console.log(`Element not found, waiting ${iterationSpeed} seconds before trying again...`);
            await new Promise(resolve => setTimeout(resolve, iterationSpeed * 1000));
        }
    } catch (error) {
        console.log(`Error waiting for element '${elementSelectorStr}': ${error}`);
        return [null, null];
    }
}

module.exports = {
    waitUntilElementIsFound,
    waitUntilElementIsFoundWithFrameLocator
}
