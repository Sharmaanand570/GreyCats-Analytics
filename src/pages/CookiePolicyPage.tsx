import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
                <h1 className="text-lg font-semibold text-foreground">Cookie Policy</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10 text-foreground">
                    <h1 className="text-3xl font-bold mb-2">GC Analytics Cookie Policy</h1>
                    <p className="text-muted-foreground mb-8">Effective date: 25 February 2026</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
                        <p className="leading-relaxed">
                            Cookies are small text files stored on your device when you visit a website. They help
                            the website remember your preferences, improve performance, and provide a better user
                            experience. GC Analytics uses cookies and similar technologies to operate and improve
                            the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">2. Types of Cookies We Use</h2>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full border-collapse border border-border text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="border border-border px-4 py-2 text-left font-semibold">Category</th>
                                        <th className="border border-border px-4 py-2 text-left font-semibold">Purpose</th>
                                        <th className="border border-border px-4 py-2 text-left font-semibold">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-border px-4 py-2 font-medium">Essential</td>
                                        <td className="border border-border px-4 py-2">Required for authentication, session management, and core functionality. The Service cannot operate without these.</td>
                                        <td className="border border-border px-4 py-2">Session / up to 30 days</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-border px-4 py-2 font-medium">Performance</td>
                                        <td className="border border-border px-4 py-2">Help us understand how users interact with the Service so we can improve features and fix issues.</td>
                                        <td className="border border-border px-4 py-2">Up to 1 year</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-border px-4 py-2 font-medium">Functional</td>
                                        <td className="border border-border px-4 py-2">Remember your preferences such as language, theme, and display settings.</td>
                                        <td className="border border-border px-4 py-2">Up to 1 year</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-border px-4 py-2 font-medium">Analytics</td>
                                        <td className="border border-border px-4 py-2">Collect aggregated, anonymous usage data for product improvement and benchmarking.</td>
                                        <td className="border border-border px-4 py-2">Up to 2 years</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">3. Third-Party Cookies</h2>
                        <p className="leading-relaxed">
                            Some cookies may be set by third-party services we use, such as analytics providers
                            and authentication platforms. These third parties have their own cookie and privacy
                            policies. We do not control third-party cookies.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">4. How to Manage Cookies</h2>
                        <p className="leading-relaxed mb-3">
                            You can control and manage cookies in several ways:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Browser Settings</strong> – Most browsers allow you to view, delete, and block cookies through their settings. Note that disabling essential cookies may prevent the Service from functioning correctly.</li>
                            <li><strong>Account Settings</strong> – You can manage optional cookie preferences in your GC Analytics account settings where available.</li>
                            <li><strong>Opt-Out Links</strong> – For third-party analytics cookies, you may use opt-out mechanisms provided by those services.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">5. Local Storage and Similar Technologies</h2>
                        <p className="leading-relaxed">
                            In addition to cookies, we may use local storage and session storage to store
                            preferences, authentication tokens, and cached data. These technologies work
                            similarly to cookies but are managed differently by your browser.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">6. Updates to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Cookie Policy from time to time. Changes will be posted on this
                            page with an updated effective date. We encourage you to review this page periodically.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
                        <p className="leading-relaxed">
                            If you have questions about our use of cookies, contact us at{" "}
                            <a href="mailto:info@greycats.tech" className="text-primary underline">
                                info@greycats.tech
                            </a>{" "}
                            or visit our{" "}
                            <Link to="/contact" className="text-primary underline">
                                contact page
                            </Link>.
                        </p>
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
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
