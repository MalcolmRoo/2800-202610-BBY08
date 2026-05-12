const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

async function findPlantInCSV(searchTerm) {
    return new Promise((resolve, reject) => {
        const csvPath = "./data/PNWPlants.csv";
        const query = searchTerm.toLowerCase().trim();
        // let match = null;
        let isResolved = false;

        const stream = fs.createReadStream(csvPath).pipe(csv()).on('data', (row) => {
            const common = (row['PlantName'] || '').toLowerCase().trim();
            const scientific = (row['ScientificName'] || '').toLowerCase().trim();

            if(common.includes(query) || scientific.includes(query)) {
                isResolved = true;
                // match = row;
                stream.destroy();
                resolve(row);
            }
        })
        .on('close', () => {
            if (!isResolved) {
                resolve(null);
            }
        })
        .on('error', (err) => reject(err));
    })
}

module.exports = {findPlantInCSV};