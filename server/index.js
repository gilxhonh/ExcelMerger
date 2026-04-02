const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Parse xlsx buffer to array of objects
function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: null });
}

// POST /api/preview — returns columns from both files
app.post('/api/preview', upload.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), (req, res) => {
  try {
    const data1 = parseExcel(req.files.file1[0].buffer);
    const data2 = parseExcel(req.files.file2[0].buffer);

    res.json({
      file1: { columns: Object.keys(data1[0] || {}), rowCount: data1.length },
      file2: { columns: Object.keys(data2[0] || {}), rowCount: data2.length }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/merge — performs the merge and returns xlsx
app.post('/api/merge', upload.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), (req, res) => {
  try {
    const { joinColumn, mergeType, columnsFromFile2 } = req.body;
    const cols2 = JSON.parse(columnsFromFile2);

    const data1 = parseExcel(req.files.file1[0].buffer);
    const data2 = parseExcel(req.files.file2[0].buffer);

    // Build lookup map from file2 keyed by joinColumn
    const map2 = new Map();
    for (const row of data2) {
      const key = row[joinColumn];
      if (key != null) map2.set(String(key), row);
    }

    const file1Keys = new Set(data1.map(r => String(r[joinColumn])));

    let merged = [];

    if (mergeType === 'left' || mergeType === 'outer') {
      for (const row of data1) {
        const key = String(row[joinColumn]);
        const match = map2.get(key) || {};
        const extra = {};
        for (const col of cols2) {
          extra[`${col}_File2`] = match[col] ?? null;
        }
        merged.push({ ...row, ...extra });
      }
    }

    if (mergeType === 'outer') {
      for (const row of data2) {
        const key = String(row[joinColumn]);
        if (!file1Keys.has(key)) {
          const base = {};
          // fill file1 columns with null
          for (const col of Object.keys(data1[0] || {})) base[col] = null;
          base[joinColumn] = row[joinColumn];
          for (const col of cols2) {
            base[`${col}_File2`] = row[col] ?? null;
          }
          merged.push(base);
        }
      }
    }

    // Sort by joinColumn
    merged.sort((a, b) => {
      const av = String(a[joinColumn] ?? '');
      const bv = String(b[joinColumn] ?? '');
      return av.localeCompare(bv);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(merged);
    XLSX.utils.book_append_sheet(wb, ws, 'Merged');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="merged.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = 4000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
