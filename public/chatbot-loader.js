(function () {
    console.log("Chatbot loader running");

    const websiteId = window.chatbotConfig?.websiteId;

    if (!websiteId) {
        console.error("Website ID missing");
        return;
    }

    // 🔥 Fetch user config from API
    fetch("https://chatbotapi.scrollosoft.com/users/get-details", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: websiteId })
    })
        .then(res => res.json())
        .then(result => {
            const user = result?.user || {};

            // 🎨 Dynamic values (with fallback)
            const primaryColor = user.primaryColor || "#009DE1";
            const secondaryColor = user.secondaryColor || "#0488c1";
            const chatPosition = user.chatPosition || "right";

            const isRight = chatPosition === "right";

            // 🔘 Create Button
            const button = document.createElement("div");

            button.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="white"/>
                </svg>
            `;

            Object.assign(button.style, {
                position: "fixed",
                bottom: "20px",
                [isRight ? "right" : "left"]: "20px",
                width: "50px",
                height: "50px",
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: "9999",
                boxShadow: `0 4px 20px ${primaryColor}66`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            });

            // 💬 Create Iframe
            const iframe = document.createElement("iframe");
            iframe.src = `https://wcchatbot.com/chatbot?websiteId=${websiteId}`;

            Object.assign(iframe.style, {
                position: "fixed",
                bottom: "75px",
                [isRight ? "right" : "left"]: "20px",
                width: "380px",
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

            // 🎯 Toggle Chat
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

            // ✨ Hover effects
            button.onmouseenter = () => {
                if (!isOpen) button.style.transform = "scale(1.1)";
            };

            button.onmouseleave = () => {
                if (!isOpen) button.style.transform = "scale(1)";
            };

            document.body.appendChild(button);
            document.body.appendChild(iframe);
        })
        .catch(err => {
            console.error("Loader API failed, using fallback", err);

            // ⚠️ Fallback UI (if API fails)
            const button = document.createElement("div");

            Object.assign(button.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "50px",
                height: "50px",
                background: primaryColor,
                borderRadius: "50%",
                zIndex: "9999",
                cursor: "pointer"
            });

            document.body.appendChild(button);
        });
})();