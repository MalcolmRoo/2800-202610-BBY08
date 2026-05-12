const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

async function findPlantInCSV(searchTerm) {
    return new Promise((resolve, reject) => {
        const csvPath = "./data/PNWPlants.csv";
        const query = searchTerm.toLowerCase().trim();
        let match = null;

        const stream = fs.createReadStream(csvPath).pipe(csv()).on('data', (row) => {
            const common = (row['CommonName'] || '').toLowerCase();
            const scientific = (row['ScientificName'] || '').toLowerCase();

            if(common.includes(query) || scientific.includes(query)) {
                match = row;
                stream.destroy();
            }
        })
        .on('end', () => resolve(match))
        .on('close', () => resolve(null))
        .on('error', (err) => reject(err));
    })
}

module.exports = {findPlantInCSV};