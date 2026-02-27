import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Globe } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 py-4 border-b bg-background sticky top-0 z-10">
                <Link
                    to="/auth/login"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                </Link>
                <h1 className="text-lg font-semibold text-foreground">Contact Us</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10 text-foreground">
                    <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
                    <p className="text-muted-foreground mb-8">
                        We'd love to hear from you. Reach out to us using any of the methods below.
                    </p>

                    <div className="grid gap-8">
                        <section className="rounded-lg border p-6">
                            <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Email</h2>
                                    <p className="leading-relaxed text-muted-foreground mb-2">
                                        For general inquiries, support, privacy requests, or data-related questions:
                                    </p>
                                    <a
                                        href="mailto:info@greycats.tech"
                                        className="text-primary underline font-medium"
                                    >
                                        info@greycats.tech
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border p-6">
                            <div className="flex items-start gap-4">
                                <Globe className="h-6 w-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Website</h2>
                                    <p className="leading-relaxed text-muted-foreground mb-2">
                                        Visit our main website for more information about our services:
                                    </p>
                                    <a
                                        href="https://greycats.tech"
                                        className="text-primary underline font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        https://greycats.tech
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border p-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Registered Office</h2>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Greycats Tech LLP<br />
                                        Mumbai, Maharashtra, India
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="mt-10">
                        <h2 className="text-xl font-semibold mb-3">Response Times</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed text-muted-foreground">
                            <li><strong className="text-foreground">General inquiries</strong> – We aim to respond within 2 business days.</li>
                            <li><strong className="text-foreground">Privacy and data requests</strong> – We will respond within applicable legal timeframes (typically 30 days).</li>
                            <li><strong className="text-foreground">Technical support</strong> – Response times depend on your plan; refer to your account settings for details.</li>
                        </ul>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-xl font-semibold mb-3">Related Pages</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li>
                                <Link to="/privacy-policy" className="text-primary underline">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className="text-primary underline">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookies" className="text-primary underline">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
