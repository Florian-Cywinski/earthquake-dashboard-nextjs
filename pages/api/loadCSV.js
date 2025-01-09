// Um die Daten zu laden

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'public', 'data', 'earthquake_data.csv');
  const file = fs.readFileSync(filePath, 'utf8');

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      res.status(200).json(results.data);
    },
  });
}