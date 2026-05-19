export type CsvRow = Record<string, string>;

type ParsedCsv = {
  headers: string[];
  rows: CsvRow[];
};

function splitCsvRecords(text: string) {
  const records: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      current += char;

      if (inQuotes && next === '"') {
        current += next;
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      records.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    records.push(current);
  }

  return records.filter((record) => record.trim().length > 0);
}

function splitCsvFields(line: string, delimiter: string) {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields.map((field) => {
    const normalized = field.replace(/^\uFEFF/, "");
    if (normalized.startsWith('"') && normalized.endsWith('"')) {
      return normalized.slice(1, -1).replace(/""/g, '"').trim();
    }

    return normalized.trim();
  });
}

function detectDelimiter(headerLine: string) {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

export function normalizeCsvHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function parseCsvText(text: string): ParsedCsv {
  const cleanedText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanedText) {
    return { headers: [], rows: [] };
  }

  const records = splitCsvRecords(cleanedText);
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(records[0]);
  const rawHeaders = splitCsvFields(records[0], delimiter);
  const headers = rawHeaders.map((header) => normalizeCsvHeader(header));

  const rows = records.slice(1).map((record) => {
    const values = splitCsvFields(record, delimiter);
    const row: CsvRow = {};

    rawHeaders.forEach((_, index) => {
      row[headers[index]] = values[index] ?? "";
    });

    return row;
  });

  return { headers, rows };
}
