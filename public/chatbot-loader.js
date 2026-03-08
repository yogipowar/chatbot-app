(function () {

    console.log("Chatbot loader running");

    const websiteId = window.chatbotConfig?.websiteId;

    const button = document.createElement("div");
    button.innerHTML = "💬";

    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.background = "#007bff";
    button.style.color = "#fff";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.borderRadius = "50%";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";

    const iframe = document.createElement("iframe");

    iframe.src =
        "https://yogipowar.github.io/chatbot-app/?websiteId=" + websiteId;

    iframe.style.position = "fixed";
    iframe.style.bottom = "90px";
    iframe.style.right = "20px";
    iframe.style.width = "380px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.display = "none";
    iframe.style.zIndex = "9999";

    button.onclick = () => {
        iframe.style.display =
        iframe.style.display === "none" ? "block" : "none";
    };

    document.body.appendChild(button);
    document.body.appendChild(iframe);

})();