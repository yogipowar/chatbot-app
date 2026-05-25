const BASE_URL = "https://chatbotapi.scrollosoft.com";

export async function crawlSite(url, options = {}) {

    const {
        maxPages = 100,
        onProgress = null,
    } = options;

    if (!url) {
        throw new Error("Website URL is required");
    }

    try {

        const response = await fetch(
            `${BASE_URL}/crawl`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                    maxPages,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to crawl website");
        }

        const data = await response.json();

        if (!data?.pages || !Array.isArray(data.pages)) {
            throw new Error("Invalid crawl response");
        }

        const processedPages = [];

        for (let i = 0; i < data.pages.length; i++) {

            const page = data.pages[i];

            if (onProgress) {
                onProgress(
                    i + 1,
                    data.pages.length,
                    page.url || ""
                );
            }

            await new Promise((resolve) =>
                setTimeout(resolve, 100)
            );

            processedPages.push(page);
        }

        return {
            ...data,
            pages: processedPages,
        };

    } catch (error) {

        console.error("crawlSite error:", error);

        throw new Error(
            error.message || "Website crawl failed"
        );
    }
}