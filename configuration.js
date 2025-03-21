const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
const dotenv = require('dotenv');

dotenv.config();

class Configuration {

    constructor() {
        this.downloadsPath = path.join(process.cwd(), 'downloads'); // Create downloads folder in current directory.

        if (!fs.existsSync(this.downloadsPath)) { // Ensure the downloads directory exists.
            fs.mkdirSync(this.downloadsPath, { recursive: true });
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

       this.setup(null, null);
    }

    getMessage() {
        return {
            content: `Get me the property details using address:${this.address} and parcel id:${this.parcelId}`
        }
    }

    setup(parcelId, address){
        this.parcelId = parcelId;
        this.address = address;
        
        
        // const url = "https://search.pascopa.com/"
        // const url = `file://${path.join(__dirname, 'parcel/example/search_pascopa.html')}`
        // pasco
        // const address = "14236 6th St., Suite 101, Dade City, FL 33523"
        // const parcelId = "33-24-16-0160-00800-0140" //working


        // this.parcelId = null; //"23-28-03-021511-000530"
        // this.address = "2345 SEA ISLAND CIR, Lakeland, FL 33810, USA"

        // //baker
        // this.parcelId = "143S21012600000850"; //"23-28-03-021511-000530"
        // this.address = "8323 TRIPS WAY, MACCLENNY, FL 32063"

        // //bradford
        // this.parcelId = "02941B00113"; // "02941-B-00113"; //"23-28-03-021511-000530"
        // this.address = "232 BRADFORD DR STARKE, FL 32091"
    }

    
}

module.exports = Configuration;
