
export const exportDataToCSV = <T extends Record<string, any>>(data: T[], filename: string): void => {
  if (data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')]; // Header row

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Quote all fields
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
