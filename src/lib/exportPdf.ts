/**
 * exportToPdf – browser-native print-to-PDF
 *
 * Opens a new window with a nicely formatted HTML table of the data,
 * triggers the browser's print dialog (which includes "Save as PDF"),
 * and closes the window when done.
 */
export function exportToPdf(
  filename: string,
  rows: Record<string, unknown>[],
  title = filename.replace(/_/g, " ")
) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const tableRows = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => {
            const val = row[h];
            return `<td>${val === null || val === undefined ? "" : String(val)}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; font-size: 12px; }
    h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #0f172a; }
    p.meta { font-size: 11px; color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #1e40af; color: #fff; }
    thead th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    tbody tr:nth-child(even) { background: #f1f5f9; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    @media print {
      body { padding: 10px; }
      thead { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generated on ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>
`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to export PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 400);
}
