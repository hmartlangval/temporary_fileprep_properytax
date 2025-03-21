const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const Configuration = require('./configuration');
const { waitUntilElementIsFoundWithFrameLocator } = require('./utils/pw.util');

class PropertyTaxHandler {

    constructor() {
        this.config = new Configuration();
    }

    async threadAwait(seconds){
        await new Promise(resolve => setTimeout(resolve, (seconds ?? 2) * 1000));
    }

    async customHandler(parcelId, address){
        this.config.setup(parcelId, address);
        this.handleRequest(this.config.getMessage());
    }

    async handleRequest(message){
    
        const user_intent = message.content;

        const promptTemplate = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf8');
        const populatedPrompt = promptTemplate.replace('${userintent}', user_intent);
    
        const response = await this.config.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in web form automation tasks. Analyze the given instructions and provide structured JSON output."
                },
                {
                    role: "user",
                    content: populatedPrompt
                }
            ],
            response_format: { type: "json_object" }
        });
    
        // console.log('the AI response is:', response.choices[0].message.content);
        const data = JSON.parse(response.choices[0].message.content);
        console.log('the AI instructions are:', data);
    
        const logFilePath = path.join(this.config.downloadsPath, 'executionlog.log');
        const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
        
        logStream.write(`${data.state} ${data.county} ${data.parcelId} - `);
        
        if(data.error){
            logStream.write(` - Error: ${data.error}\n`);
            logStream.end();
            return;
        }


        const browser = await chromium.launch({
            headless: false, // Set to true for production use
            // slowMo: 100 // Slows down Playwright operations for demo purposes
        });
        const context = await browser.newContext();
        const page = await context.newPage();
    
        let is_completed = false;
    
        const __url = data.url.startsWith('http') ? data.url : `file://${path.join(__dirname, 'parcel', 'example', data.url)}`;
        await page.goto(__url, { timeout: 300000 });
        await page.waitForLoadState('load');
    
        for (const instruction of (data.instructions ?? [])) {
    
            // this is an optional selector chec,
            // we will check for presence of optional selector, if it does, we continue with the action
            // if optional fails, we resume and move on to the next instruction
            if ('check_selector' in instruction) {
                try {
                    await waitUntilElementIsFoundWithFrameLocator(page, instruction.check_selector, 10000);
                    // await page.waitForSelector(instruction.check_selector, { timeout: 15000 });
                    // do nothing here as conditions satisfies, loop will continue to execute the action
    
                } catch (error) {
                    if (error.name === 'TimeoutError') {
                        console.log(`Selector "${instruction.check_selector}" not found within the timeout.`);
                        // Handle the case where the selector is not found
                    } else {
                        console.error('An error occurred:', error);
                    }
                    continue;
                }
            }
    
            switch(instruction.action){
                case "type":
                    const [el, loc] = await waitUntilElementIsFoundWithFrameLocatorementIsFound(page, instruction.selector);
                    await loc.fill(instruction.value);
                    // await page.fill(instruction.selector, instruction.value);
                    await page.waitForTimeout(100);
                    break;
                case "click":
                    const [el2, loc2] = await waitUntilElementIsFoundWithFrameLocatorementIsFound(page, instruction.selector);
                    // await page.locator(instruction.selector).click();
                    await loc2.click();
                    await page.waitForTimeout(100);
                    break;
                case "select":
                    const [el3, loc3] = await waitUntilElementIsFoundWithFrameLocatorementIsFound(page, instruction.selector);
                    await loc3.selectOption(instruction.value);
                    await page.waitForTimeout(100);
                    break;
                case "wait":
                    // await page.waitForTimeout((instruction.value ?? 2) * 1000);
                    await this.threadAwait(instruction.value ?? 2);
                    break;
                case "enter":
                    await page.keyboard.press('Enter');
                    await this.threadAwait(2);
                    break;
                case "print pdf":
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    await this.threadAwait(1);
                    await page.pdf({ path: path.join(this.config.downloadsPath, `account_${data.parcelId ?? "property"}_${timestamp}.pdf`) });
                    is_completed = true;
                    break;
            }
        }
    
        logStream.write(' - Done.\n');
        logStream.end();
    
    
        if (is_completed) {
            await browser.close();
        }
    }
}


module.exports = PropertyTaxHandler;