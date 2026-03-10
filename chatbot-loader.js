(function () {
    console.log("Chatbot loader running");

    const websiteId = window.chatbotConfig?.websiteId;

    // 1. Create the floating button
    const button = document.createElement("div");
    
    // Using the Sparkle SVG directly in the button for a premium look
    button.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
        </svg>
    `;

    // 2. Button Styling (Matching your Indigo/Violet gradient)
    Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex: "9999",
        boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
        transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    });

    // 3. Iframe Styling (Adding a smooth slide-up animation)
    const iframe = document.createElement("iframe");
    iframe.src = `https://yogipowar.github.io/chatbot-app/?websiteId=${websiteId}`;

    Object.assign(iframe.style, {
        position: "fixed",
        bottom: "95px",
        right: "20px",
        width: "385px",
        height: "550px",
        border: "none",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        zIndex: "9999",
        display: "none",
        opacity: "0",
        transform: "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
    });

    // 4. Toggle Logic with Animation
    let isOpen = false;
    button.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframe.style.display = "block";
            button.style.transform = "scale(0.9) rotate(90deg)";
            // Small timeout to allow display:block to hit the DOM before animating
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

    // 5. Hover Effects
    button.onmouseenter = () => { if(!isOpen) button.style.transform = "scale(1.1)"; };
    button.onmouseleave = () => { if(!isOpen) button.style.transform = "scale(1)"; };

    document.body.appendChild(button);
    document.body.appendChild(iframe);

})();