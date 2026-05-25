import { jsPDF } from "jspdf";

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 7;

function addWrappedText(doc, text, x, y, options = {}) {
    const {
        fontSize = 11,
        fontStyle = "normal",
    } = options;

    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);

    for (const line of lines) {

        if (y > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
        }

        doc.text(line, x, y);

        y += LINE_HEIGHT;
    }

    return y;
}

export async function generateCrawlPdf(result) {
    if (!result?.pages?.length) {
        throw new Error("No pages found");
    }

    const doc = new jsPDF();

    let y = MARGIN;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text("Website Crawl Report", MARGIN, y);

    y += 12;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, y);

    y += 8;

    doc.text(`Total Pages: ${result.pages.length}`, MARGIN, y);

    y += 15;

    for (let i = 0; i < result.pages.length; i++) {
        const page = result.pages[i];

        if (i !== 0) {
            doc.addPage();
            y = MARGIN;
        }

        y = addWrappedText(doc, page.title || "Untitled Page", MARGIN, y, {
            fontSize: 18,
            fontStyle: "bold",
        });

        y += 3;

        y = addWrappedText(doc, page.url, MARGIN, y, {
            fontSize: 10,
        });

        y += 8;

        if (page.content?.length) {
            for (const block of page.content) {
                const isHeading = block.type === "heading";

                y = addWrappedText(doc, block.text, MARGIN, y, {
                    fontSize: isHeading ? 13 : 11,
                    fontStyle: isHeading ? "bold" : "normal",
                });

                y += 3;
            }
        } else {
            y = addWrappedText(doc, "No content found.", MARGIN, y);
        }
    }

    const pdfBlob = doc.output("blob");

    return pdfBlob;
}