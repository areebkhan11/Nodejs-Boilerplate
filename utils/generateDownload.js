const pdfkit = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const generateDownload = async (data, format, res, activityFields) => {
    if (format === 'pdf') {
        // Generate PDF
        const pdfDoc = new pdfkit();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=activity_details.pdf');
        pdfDoc.pipe(res);
        pdfDoc.fontSize(14).text('Fleet Service Activity Details', { align: 'center' });

        try {
            data.schedules.forEach(activity => {
                pdfDoc.fontSize(12);
                activityFields.forEach(field => {
                    pdfDoc.text(`${field.label}: ${field.getValue(activity)} | `, { continued: true });
                });
                pdfDoc.moveDown();
            });
            pdfDoc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ success: false, error: 'Error generating PDF' });
        } finally {
            console.log('Closing PDF stream.');
        }
    } else if (format === 'csv') {
        // Generate CSV
        const csvData = data.schedules.map(activity => {
            const rowData = {};
            activityFields.forEach(field => {
                rowData[field.id] = field.getValue(activity);
            });
            return rowData;
        });

        const csvWriter = createCsvWriter({
            path: 'activity_details.csv',
            header: activityFields.map(field => ({ id: field.id, title: field.label })),
        });

        csvWriter.writeRecords(csvData)
            .then(() => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=activity_details.csv');
                res.download('activity_details.csv');
            });
    } else {
        res.status(400).json({ success: false, error: 'Invalid format specified' });
    }
};

module.exports = generateDownload;