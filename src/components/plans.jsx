import React, { useState, useEffect } from "react";
import {
    Eye,
    EyeOff,
    Zap,
    Brain,
    Link2,
    BarChart3,
    Languages,
    Lock,
    Search,
    MessageSquareText,
    Code2,
    Headphones,
    ShoppingCart,
    Users,
    Building2,
    GraduationCap,
    Stethoscope,
    PlugZap,
    ShieldCheck,
    Clock3,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { crawlSite } from "../api/crawlApi";
import { generateCrawlPdf } from "../utils/generatePdf"
import "./plans.css";



// --- Sub-Component: AddAdminModal ---
const AddAdminModal = ({ onClose, onSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [resourceType, setResourceType] = useState("website");
    const [sitemapValue, setSitemapValue] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [url, setUrl] = useState('')
    const [maxPages, setMaxPages] = useState(100000)
    const [loading, setLoading] = useState(false)
    const [crawlError, setCrawlError] = useState(null)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [showCrawlerDialog, setShowCrawlerDialog] = useState(false)
    const [generatedPdf, setGeneratedPdf] = useState(null)

    async function crawlhandleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setCrawlError(null);
        setShowCrawlerDialog(true);

        try {

            // Initial message
            setLoadingMessage("Starting website crawl...");

            const data = await crawlSite(
                url,
                {
                    maxPages: Number(maxPages),

                    // Progress callback
                    onProgress: (current, total) => {
                        setLoadingMessage(
                            `Fetching pages ${current} / ${total}`
                        );
                    },
                }
            );

            setLoadingMessage("Extracting content...");

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLoadingMessage("Generating PDF...");

            const pdfBlob = await generateCrawlPdf(data);

            const pdfUrl = URL.createObjectURL(pdfBlob);

            setGeneratedPdf(pdfUrl);

            setLoadingMessage("Data fetched successfully");

            setLoading(false);

            setTimeout(() => {
                setShowCrawlerDialog(false);
            }, 2000);

        } catch (err) {

            console.error(err);

            setLoading(false);

            setCrawlError(err.message || "Failed to crawl website");

            setLoadingMessage("Something went wrong");

            setTimeout(() => {
                setShowCrawlerDialog(false);
            }, 2000);
        }
    }

    const handleResourceChange = (type) => {
        setResourceType(type);
        setPdfFile(null);
        setSitemapValue("");
        setError("");
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");

        try {

            if (!isValidEmail(username)) {
                setError("Please enter a valid email address");
                setSubmitting(false);
                return;
            }

            const formData = new FormData();

            formData.append("username", username);
            formData.append("password", password);
            formData.append("role", "2");

            // =========================
            // WEBSITE PDF
            // =========================
            if (resourceType === "website") {

                if (!generatedPdf) {
                    setError("Please generate PDF first");
                    setSubmitting(false);
                    return;
                }

                const response = await fetch(generatedPdf);

                const blob = await response.blob();

                const file = new File(
                    [blob],
                    "website-content.pdf",
                    {
                        type: "application/pdf",
                    }
                );

                formData.append("uploaded_file", file);
            }

            // =========================
            // PDF FILE
            // =========================
            else if (resourceType === "pdf") {

                if (!pdfFile) {
                    setError("Please upload a PDF file");
                    setSubmitting(false);
                    return;
                }

                formData.append("uploaded_file", pdfFile);
            }

            // =========================
            // SITEMAP
            // =========================
            else if (resourceType === "sitemap") {

                if (!sitemapValue.trim()) {
                    setError("Please enter Sitemap URL");
                    setSubmitting(false);
                    return;
                }

                formData.append("sitemapUrl", sitemapValue);
            }

            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/users/register",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.status || data.success) {
                onSuccess();
                navigate("/login");
            } else {
                setError(data.message || "Registration failed");
            }

        } catch (err) {

            console.error(err);

            setError("Failed to register admin");

        } finally {

            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Setup Elite Bot</h3>
                    <p>Initialize your AI agent with your business data.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Business Email</label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin@company.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                            />

                            <span
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Knowledge Source</label>

                        <div className="radio-group">
                            {/* <label className={resourceType === "sitemap" ? "active" : ""}>
                                <input
                                    type="radio"
                                    checked={resourceType === "sitemap"}
                                    onChange={() => handleResourceChange("sitemap")}
                                />
                                Sitemap URL
                            </label> */}
                            <label className={resourceType === "website" ? "active" : ""}>
                                <input
                                    type="radio"
                                    checked={resourceType === "website"}
                                    onChange={() => handleResourceChange("website")}
                                />
                                Website URL
                            </label>
                            <label className={resourceType === "pdf" ? "active" : ""}>
                                <input
                                    type="radio"
                                    checked={resourceType === "pdf"}
                                    onChange={() => handleResourceChange("pdf")}
                                />
                                PDF Document
                            </label>


                        </div>
                    </div>
                    <div className="form-group">

                        {resourceType === "pdf" && (
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                    id="pdf-upload"
                                />

                                <label htmlFor="pdf-upload" className="file-label">
                                    {pdfFile ? `Selected: ${pdfFile.name}` : "Click to upload PDF"}
                                </label>
                            </div>
                        )}

                        {/* {resourceType === "sitemap" && (
                            <input
                                type="text"
                                value={sitemapValue}
                                onChange={(e) => setSitemapValue(e.target.value)}
                                placeholder="https://example.com/sitemap.xml"
                                className="full-input"
                            />
                        )} */}

                        {resourceType === "website" && (
                            <div className="app">

                                <div className="url-form">

                                    <label htmlFor="site-url">Website URL</label>

                                    <div className="url-row">
                                        <input
                                            id="site-url"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            disabled={loading}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={crawlhandleSubmit}
                                            disabled={loading || !url.trim()}
                                        >
                                            {loading ? "Crawling..." : "crawl"}
                                        </button>
                                    </div>

                                    {/* <div className="options">
                                        <label htmlFor="max-pages">Max pages</label>

                                        <input
                                            id="max-pages"
                                            type="number"
                                            min={1}
                                            max={1000}
                                            value={maxPages}
                                            onChange={(e) => setMaxPages(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div> */}
                                </div>

                                {generatedPdf && (
                                    <div className="generated-pdf-preview">

                                        <h4>Generated PDF</h4>

                                        <iframe
                                            src={generatedPdf}
                                            title="Generated PDF"
                                            width="100%"
                                            height="400px"
                                        />

                                        <a
                                            href={generatedPdf}
                                            download="website-content.pdf"
                                            className="download-btn"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                )}

                                {crawlError && (
                                    <div className="error-banner">
                                        {crawlError}
                                    </div>
                                )}

                                {showCrawlerDialog && (
                                    <div className="crawler-dialog-overlay">
                                        <div className="crawler-dialog">

                                            <div className="loader"></div>

                                            <h3>{loadingMessage}</h3>

                                            <p>
                                                Please wait while we crawl the website and prepare your PDF.
                                            </p>

                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                    {error && <div className="modal-error">{error}</div>}
                    <div className="modal-actions">
                        <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-submit-btn" disabled={submitting}>
                            {submitting ? "Processing..." : "Create Account"}
                        </button>
                    </div>
                    <div className="modal-footer-text">
                        Already have an account?{" "}
                        <span
                            className="login-link"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </div>

                </form>


                {/* <div className="app">

                    <form className="url-form" onSubmit={crawlhandleSubmit}>
                        <label htmlFor="site-url">Website URL</label>
                        <div className="url-row">
                            <input
                                id="site-url"
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button type="submit" disabled={loading || !url.trim()}>
                                {loading ? 'Crawling…' : 'Crawl site'}
                            </button>
                        </div>

                        <div className="options">
                            <label htmlFor="max-pages">Max pages</label>
                            <input
                                id="max-pages"
                                type="number"
                                min={1}
                                max={1000}
                                value={maxPages}
                                onChange={(e) => setMaxPages(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </form>


                    {crawlError && <div className="error-banner">{crawlError}</div>}

                    {showCrawlerDialog && (
                        <div className="crawler-dialog-overlay">
                            <div className="crawler-dialog">
                                <div className="loader"></div>

                                <h3>{loadingMessage}</h3>

                                <p>
                                    Please wait while we crawl the website and prepare your PDF.
                                </p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="progress">
                            <p>Crawling website using Puppeteer...</p>
                        </div>
                    )}


                </div> */}
            </div>
        </div>
    );
};

// --- Main Component ---
const Plans = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [billingCycle, setBillingCycle] = useState("annual");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const elitePrice = billingCycle === "monthly" ? 25 : 20;
    const elitePeriod = billingCycle === "monthly" ? "/month" : "/mo (billed annually)";
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSuccess = () => {
        setIsModalOpen(false);
    };

    const features = [
        { icon: Zap, title: "Instant Setup", desc: "Deploy an AI chatbot on your business website in under 5 minutes. No coding required." },
        { icon: Brain, title: "Smart Conversations", desc: "Understand visitor intent, answer FAQs, qualify leads, and route complex questions to your team." },
        { icon: Link2, title: "Seamless Integration", desc: "Works with WordPress, Shopify, Webflow, Wix, Squarespace, and custom websites." },
        { icon: BarChart3, title: "Analytics Dashboard", desc: "Track conversations, conversion rates, missed questions, and customer satisfaction in real time." },
        { icon: Languages, title: "Multilingual Support", desc: "Engage visitors in 50+ languages so your website can serve a global audience." },
        { icon: Lock, title: "Enterprise Security", desc: "Encrypted data handling, access controls, and privacy-first workflows for customer conversations." },
    ];

    const stats = [
        { value: "24/7", label: "visitor support" },
        { value: "<5 min", label: "average setup" },
        { value: "50+", label: "languages supported" },
        { value: "1 script", label: "to go live" },
    ];

    const problemPoints = [
        "Visitors leave when answers are hard to find.",
        "Contact forms miss buyers who need help right now.",
        "Support teams repeat the same answers every day.",
    ];

    const steps = [
        {
            icon: Search,
            title: "Connect Your Knowledge",
            desc: "Add your sitemap or PDFs.",
        },
        {
            icon: MessageSquareText,
            title: "Train Your AI Assistant",
            desc: "WC Chatbot learns your content and prepares accurate answers grounded in your business data.",
        },
        {
            icon: Code2,
            title: "Add It to Your Site",
            desc: "Paste one embed script and start answering questions, capturing leads, and guiding visitors.",
        },
    ];

    const useCases = [
        { icon: Headphones, title: "Customer Support", desc: "Answer order, pricing, policy, troubleshooting, and FAQ questions instantly." },
        { icon: ShoppingCart, title: "Ecommerce Sales", desc: "Recommend products, reduce hesitation, and recover shoppers before they leave." },
        { icon: Users, title: "Lead Generation", desc: "Collect visitor details, qualify intent, and send high-quality leads to your team." },
        { icon: Building2, title: "Service Businesses", desc: "Share availability, services, locations, pricing ranges, and appointment options." },
        { icon: GraduationCap, title: "Education", desc: "Guide students through admissions, courses, fees, deadlines, and campus information." },
        { icon: Stethoscope, title: "Healthcare", desc: "Help patients find clinic details, services, documents, and common care information." },
    ];

    const integrations = [
        "WordPress",
        "Shopify",
        "Wix",
        "Webflow",
        "Squarespace",
        "Custom HTML",
        "CRM",
        "Webhooks",
    ];

    const eliteFeatures = [
        "Unlimited conversations",
        "Advanced AI model access",
        "Custom branding & styling",
        "Priority email & chat support",
        "Analytics & reporting dashboard",
        "Lead capture & CRM integrations",
        "Multi-language support (50+)",
        "Webhook & API access",
    ];

    const customFeatures = [
        "Everything in Elite",
        "Dedicated account manager",
        "Custom AI model fine-tuning",
        "SLA & uptime guarantee (99.99%)",
        "On-premise deployment option",
        "Advanced security & compliance",
        "Unlimited team seats",
        "White-label solution",
    ];

    const faqs = [
        {
            q: "How does WC Chatbot learn about my business?",
            a: "You can train it with your sitemap URL, website pages, PDFs, service documents, FAQs, and other business knowledge sources.",
        },
        {
            q: "Do I need a developer to install it?",
            a: "No. After setup, you receive a simple embed script that can be added to most website builders and custom sites.",
        },
        {
            q: "Can the chatbot capture leads?",
            a: "Yes. It can collect names, emails, phone numbers, requirements, and other qualifying details during the conversation.",
        },
        {
            q: "What happens when the bot cannot answer?",
            a: "You can review unanswered questions, improve your knowledge base, and route important conversations to your team.",
        },
    ];

    return (
        <div className="landing-page">
            <nav className={`landing-nav ${isScrolled ? "scrolled" : ""}`}>
                <div className="landing-logo">
                    <img className="landing-logo-img" src="/logo.png" alt="WC Chatbot" />
                </div>
                <ul className="landing-nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#use-cases">Use Cases</a></li>
                    <li><a href="#human-support">Human Chat</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    {/* <li><a href="#faq">FAQ</a></li> */}
                </ul>
                <div className="landing-nav-actions">
                    <button className="landing-login-btn" onClick={() => navigate("/login")}>
                        Login
                    </button>
                    <button className="landing-nav-cta" onClick={() => setIsModalOpen(true)}>Get Started</button>
                </div>
            </nav>

            <section className="landing-hero">
                <div className="landing-badge">
                    <span className="landing-badge-dot" />
                    AI-Powered for Business
                </div>
                <h1>Add AI Chatbot to Your Website in 2 Minutes <span>Capture Leads 24/7</span></h1>
                <p>Deploy an intelligent AI chatbot that engages visitors 24/7, answers questions instantly, and converts leads - all on autopilot.</p>
                <div className="landing-hero-buttons">
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        Start Free Trial <ArrowRight size={18} />
                    </button>
                </div>
                <div className="landing-trust-row">
                    <span>No credit card required</span>
                    <span>Works with any website</span>
                    <span>Launch-ready in minutes</span>
                </div>
            </section>

            <section className="landing-stats" aria-label="WC Chatbot platform highlights">
                {stats.map((stat) => (
                    <div className="stat-item" key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                    </div>
                ))}
            </section>

            <section className="landing-problem">
                <div className="problem-copy">
                    <div className="landing-section-label">The Website Gap</div>
                    <h2 className="landing-section-title left">Your Website Has Answers. Visitors Still Need Help Finding Them.</h2>
                    <p>
                        Most visitors do not want to search menus, read long FAQ pages, or wait for email replies.
                        WC Chatbot turns your existing content into a guided conversation that helps buyers move forward.
                    </p>
                    <div className="problem-list">
                        {problemPoints.map((item) => (
                            <div className="problem-row" key={item}>
                                <CheckCircle2 size={18} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="assistant-preview" aria-label="Chatbot conversation preview">
                    <div className="assistant-preview-header">
                        <span className="assistant-status" />
                        WC Chatbot Online
                    </div>
                    <div className="landing-chat-bubble visitor">Do you offer support after business hours?</div>
                    <div className="landing-chat-bubble bot">Yes. I can answer common questions, capture your details, and help our team follow up when they are back online.</div>
                    <div className="landing-chat-bubble visitor">Can I get pricing for my website?</div>
                    <div className="landing-chat-bubble bot">Absolutely. Tell me your website URL and what you want the chatbot to handle.</div>
                </div>
            </section>

            <section className="landing-features" id="features">
                <div className="landing-section-label">Why WC Chatbot AI</div>
                <h2 className="landing-section-title">Everything Your Business Needs</h2>
                <div className="landing-features-grid">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div className="feature-card" key={f.title}>
                                <div className="feature-icon"><Icon size={22} /></div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="landing-steps" id="how-it-works">
                <div className="landing-section-label">How It Works</div>
                <h2 className="landing-section-title">From Website Content to Live AI Assistant</h2>
                <div className="steps-grid">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div className="step-card" key={step.title}>
                                <div className="step-number">0{index + 1}</div>
                                <div className="step-icon"><Icon size={22} /></div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="landing-use-cases" id="use-cases">
                <div className="landing-section-label">Use Cases</div>
                <h2 className="landing-section-title">Built for Support, Sales, and Service Teams</h2>
                <div className="use-case-grid">
                    {useCases.map((useCase) => {
                        const Icon = useCase.icon;
                        return (
                            <div className="use-case-card" key={useCase.title}>
                                <Icon size={22} />
                                <h3>{useCase.title}</h3>
                                <p>{useCase.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="landing-integrations">
                <div className="integrations-copy">
                    <div className="landing-section-label">Integrations</div>
                    <h2 className="landing-section-title left">Install Once. Connect Everywhere.</h2>
                    <p>
                        Add WC Chatbot to your site with a lightweight script, then connect it to your lead flow,
                        CRM, or internal tools with webhooks and API access.
                    </p>
                </div>
                <div className="integration-cloud">
                    {integrations.map((item) => (
                        <span key={item}><PlugZap size={16} /> {item}</span>
                    ))}
                </div>
            </section>

            <section className="landing-human-support" id="human-support">
                <div className="human-support-card">
                    <div className="human-support-copy">
                        <div className="landing-section-label">Human Handoff</div>
                        <h2 className="landing-section-title left">When Visitors Need a Person, Your Team Can Join the Chat</h2>
                        <p>
                            WC Chatbot can handle routine questions automatically, but customers can still connect with a real human when they need personal help, pricing guidance, booking support, or a complex answer.
                        </p>
                        <div className="handoff-points">
                            <div><CheckCircle2 size={18} /> Live chat handoff from bot to team</div>
                            <div><CheckCircle2 size={18} /> Collect visitor details before your agent replies</div>
                            <div><CheckCircle2 size={18} /> Keep conversation history so agents understand context</div>
                        </div>
                    </div>
                    <div className="human-chat-preview" aria-label="Human support chat preview">
                        <div className="assistant-preview-header">
                            <span className="assistant-status" />
                            Human Support Available
                        </div>
                        <div className="landing-chat-bubble visitor">I want to talk with someone about a custom plan.</div>
                        <div className="landing-chat-bubble bot">Sure. I have shared your request with our support team. Can you confirm your business email?</div>
                        <div className="human-agent-chip">
                            <Users size={16} />
                            Agent joining with full chat context
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-security">
                <div className="security-card">
                    <ShieldCheck size={28} />
                    <h3>Grounded in Your Business Knowledge</h3>
                    <p>Train from trusted content sources so the chatbot answers with the information your team actually approves.</p>
                </div>
                <div className="security-card">
                    <Clock3 size={28} />
                    <h3>Always-On Customer Response</h3>
                    <p>Capture questions and leads after hours, during campaigns, and when your support queue is busy.</p>
                </div>
                <div className="security-card">
                    <BarChart3 size={28} />
                    <h3>Conversation Insights</h3>
                    <p>Discover common objections, missing website content, and opportunities to improve your customer journey.</p>
                </div>
            </section>

            <section className="landing-pricing" id="pricing">
                <div className="landing-section-label">Pricing</div>
                <h2 className="landing-section-title">Choose Your Plan</h2>

                <div className="billing-toggle">
                    <button
                        className={`billing-option ${billingCycle === "monthly" ? "active" : ""}`}
                        onClick={() => setBillingCycle("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`billing-option ${billingCycle === "annual" ? "active" : ""}`}
                        onClick={() => setBillingCycle("annual")}
                    >
                        Annual <span className="billing-save">Save 20%</span>
                    </button>
                </div>

                <div className="landing-pricing-grid">
                    <div className="pricing-card featured">
                        <div className="popular-badge">Most Popular</div>
                        <div className="pricing-plan-name">Elite Plan</div>
                        <p className="pricing-plan-desc">Perfect for growing businesses that want powerful AI support without limits.</p>
                        <div className="pricing-price">
                            <span className="pricing-amount">${elitePrice}</span>
                            <span className="pricing-period">{elitePeriod}</span>
                        </div>
                        <ul className="pricing-features">
                            {eliteFeatures.map((f) => (
                                <li key={f}><span className="pricing-check">✓</span> {f}</li>
                            ))}
                        </ul>
                        <button
                            className="pricing-btn pricing-btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Get Elite Plan
                        </button>
                    </div>

                    <div className="pricing-card">
                        <div className="pricing-plan-name">Custom Plan</div>
                        <p className="pricing-plan-desc">Tailored solutions for enterprises with unique requirements and scale.</p>
                        <div className="pricing-price">
                            <span className="pricing-amount">Custom</span>
                        </div>
                        <ul className="pricing-features">
                            {customFeatures.map((f) => (
                                <li key={f}><span className="pricing-check">✓</span> {f}</li>
                            ))}
                        </ul>
                        <a className="pricing-btn pricing-btn-outline" href="#contact">Contact Sales</a>
                    </div>
                </div>
            </section>

            <section className="landing-faq" id="faq">
                <div className="landing-section-label">FAQ</div>
                <h2 className="landing-section-title">Questions Before You Launch</h2>
                <div className="faq-list">
                    {faqs.map((faq) => (
                        <details className="faq-item" key={faq.q}>
                            <summary>{faq.q}</summary>
                            <p>{faq.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="landing-final-cta" id="contact">
                <div>
                    <div className="landing-section-label">Ready to Grow?</div>
                    <h2>Turn Your Website Into a 24/7 Sales and Support Assistant</h2>
                    <p>Launch WC Chatbot today and give every visitor an instant path to answers, trust, and action.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    Create Your Bot <ArrowRight size={18} />
                </button>
            </section>

            {isModalOpen && (
                <AddAdminModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            <footer className="landing-footer">
                <p>© 2026 WC chatbot. All rights reserved.</p>
                <p>Developed and Designed By Web Create Hub</p>
            </footer>
        </div>
    );
};

export default Plans;
