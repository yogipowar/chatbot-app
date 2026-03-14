(function () {
    console.log("Chatbot loader running");

    const websiteId = window.chatbotConfig?.websiteId;

    const button = document.createElement("div");
    
    // Using the Sparkle SVG directly in the button for a premium look
   button.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="white"/>
        </svg>
    `;

    Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        background: "linear-gradient(135deg, #4285f4 0%, #9b72cb 50%, #d96570 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex: "9999",
        boxShadow: "0 4px 20px rgba(66, 133, 244, 0.4)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    });

    const iframe = document.createElement("iframe");
    iframe.src = `https://yogipowar.github.io/chatbot-app/?websiteId=${websiteId}`;

    Object.assign(iframe.style, {
        position: "fixed",
        bottom: "75px",
        right: "20px",
        width: "385px",
        height: "500px",
        border: "none",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        zIndex: "9999",
        display: "none",
        opacity: "0",
        transform: "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
    });

    let isOpen = false;
    button.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframe.style.display = "block";
            button.style.transform = "scale(0.9) rotate(90deg)";
            setTimeout(() => {
                iframe.style.opacity = "1";
                iframe.style.transform = "translateY(0)";
            }, 10);
        } else {
            iframe.style.opacity = "0";
            iframe.style.transform = "translateY(20px)";
            button.style.transform = "scale(1) rotate(0deg)";
            setTimeout(() => {
                iframe.style.display = "none";
            }, 300);
        }
    };

    button.onmouseenter = () => { if(!isOpen) button.style.transform = "scale(1.1)"; };
    button.onmouseleave = () => { if(!isOpen) button.style.transform = "scale(1)"; };

    document.body.appendChild(button);
    document.body.appendChild(iframe);

})();