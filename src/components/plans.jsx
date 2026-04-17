import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './plans.css';

// --- Sub-Component: AddAdminModal ---
const AddAdminModal = ({ onClose, onSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [resourceType, setResourceType] = useState("sitemap");
    const [sitemapValue, setSitemapValue] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleResourceChange = (type) => {
        setResourceType(type);
        setPdfFile(null);
        setSitemapValue("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("role", "2");

        if (resourceType === "pdf") {
            if (!pdfFile) {
                setError("Please upload a PDF file");
                setSubmitting(false);
                return;
            }
            formData.append("uploaded_file", pdfFile);
        } else {
            if (!sitemapValue.trim()) {
                setError("Please enter Sitemap URL");
                setSubmitting(false);
                return;
            }
            formData.append("sitemapUrl", sitemapValue);
        }

        try {
            const res = await fetch("https://chatbotapi.scrollosoft.com/users/register", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.status || data.success) {
                onSuccess();
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
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
                            <label className={resourceType === 'sitemap' ? 'active' : ''}>
                                <input
                                    type="radio"
                                    checked={resourceType === "sitemap"}
                                    onChange={() => handleResourceChange("sitemap")}
                                />
                                Sitemap URL
                            </label>
                            <label className={resourceType === 'pdf' ? 'active' : ''}>
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
                        {resourceType === "pdf" ? (
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
                        ) : (
                            <input
                                type="text"
                                value={sitemapValue}
                                onChange={(e) => setSitemapValue(e.target.value)}
                                placeholder="https://example.com/sitemap.xml"
                                className="full-input"
                            />
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
            </div>
        </div>
    );
};

// --- Main Component ---
const Plans = () => {
    // 1. Navigation State
    const [isScrolled, setIsScrolled] = useState(false);

    // 2. Billing State
    const [billingCycle, setBillingCycle] = useState('monthly');
    const elitePrice = billingCycle === 'monthly' ? 99 : 79;
    const elitePeriod = billingCycle === 'monthly' ? '/month' : '/mo (billed annually)';

    // 3. Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSuccess = () => {
        setIsModalOpen(false);
        // alert("Registration Successful! Check your dashboard to start training your bot.");
    };

    const features = [
        { icon: '⚡', title: 'Instant Setup', desc: 'Deploy an AI chatbot on your business website in under 5 minutes. No coding required.' },
        { icon: '🧠', title: 'Smart Conversations', desc: 'Powered by advanced AI that understands context, handles FAQs, and qualifies leads automatically.' },
        { icon: '🔗', title: 'Seamless Integration', desc: 'Works with any website platform — WordPress, Shopify, Webflow, or custom-built sites.' },
        { icon: '📊', title: 'Analytics Dashboard', desc: 'Track conversations, conversion rates, and customer satisfaction in real-time.' },
        { icon: '🌐', title: 'Multilingual Support', desc: 'Engage visitors in 50+ languages. Break barriers and serve a global audience.' },
        { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 compliant with end-to-end encryption. Your customer data stays safe.' },
    ];

    const eliteFeatures = [
        'Unlimited conversations',
        'Advanced AI model access',
        'Custom branding & styling',
        'Priority email & chat support',
        'Analytics & reporting dashboard',
        'Lead capture & CRM integrations',
        'Multi-language support (50+)',
        'Webhook & API access',
    ];

    const customFeatures = [
        'Everything in Elite',
        'Dedicated account manager',
        'Custom AI model fine-tuning',
        'SLA & uptime guarantee (99.99%)',
        'On-premise deployment option',
        'Advanced security & compliance',
        'Unlimited team seats',
        'White-label solution',
    ];

    return (
        <div className="landing-page">
            {/* Sticky Nav */}
            <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
                <div className="landing-logo">LOGO</div>
                <ul className="landing-nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <button className="landing-nav-cta" onClick={() => setIsModalOpen(true)}>Get Started</button>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="landing-badge">
                    <span className="landing-badge-dot" />
                    AI-Powered for Business
                </div>
                <h1>Add AI Chatbot to Your Website in 2 Minutes <span>Capture Leads 24/7 </span></h1>
                <p>Deploy an intelligent AI chatbot that engages visitors 24/7, answers questions instantly, and converts leads — all on autopilot.</p>
                <div className="landing-hero-buttons">
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Start Free Trial</button>
                    {/* <button className="btn-secondary">Watch Demo</button> */}
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features" id="features">
                <div className="landing-section-label">Why BotForge AI</div>
                <h2 className="landing-section-title">Everything Your Business Needs</h2>
                <div className="landing-features-grid">
                    {features.map((f) => (
                        <div className="feature-card" key={f.title}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="landing-pricing" id="pricing">
                <div className="landing-section-label">Pricing</div>
                <h2 className="landing-section-title">Choose Your Plan</h2>

                {/* Billing Toggle */}
                <div className="billing-toggle">
                    <button
                        className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`billing-option ${billingCycle === 'annual' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('annual')}
                    >
                        Annual <span className="billing-save">Save 20%</span>
                    </button>
                </div>

                <div className="landing-pricing-grid">
                    {/* Elite Plan */}
                    <div className="pricing-card featured">
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

                    {/* Custom Plan */}
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
                        <button className="pricing-btn pricing-btn-outline">Contact Sales</button>
                    </div>
                </div>
            </section>

            {/* Modal Logic */}
            {isModalOpen && (
                <AddAdminModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            <footer className="landing-footer">
                © 2026 BotForge AI. All rights reserved.
            </footer>
        </div>
    );
};

export default Plans;