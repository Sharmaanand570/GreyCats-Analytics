import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 py-4 border-b bg-background sticky top-0 z-10">
                <Link
                    to="/auth/login"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                </Link>
                <h1 className="text-lg font-semibold text-foreground">Terms of Service</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10 text-foreground">
                    <h1 className="text-3xl font-bold mb-2">GC Analytics Terms and Conditions</h1>
                    <p className="text-muted-foreground mb-8">Effective date: 25 February 2026</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                        <p className="leading-relaxed">
                            GC Analytics is a service provided by Greycats Tech LLP that offers a standardized
                            interface and reporting tools to view and analyze clients' social media and Google
                            account data. These Terms and Conditions govern your access to and use of GC
                            Analytics. By creating an account, connecting third‑party services, or otherwise using
                            the Service you agree to these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Service</strong> – GC Analytics, including dashboards, APIs, reports, integrations, and documentation.</li>
                            <li><strong>User</strong> – any individual or entity that registers for or uses the Service.</li>
                            <li><strong>Client Data</strong> – data you or your connected third‑party accounts provide or authorize us to access.</li>
                            <li><strong>Account</strong> – the user account created to access the Service.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">3. Eligibility and Account Registration</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Eligibility</strong> – You must be at least 18 years old and have authority to bind any organization you represent.</li>
                            <li><strong>Account Information</strong> – You agree to provide accurate, current, and complete information and to keep it updated.</li>
                            <li><strong>Credentials</strong> – You are responsible for maintaining the confidentiality of your login credentials and for all activity under your Account.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">4. Scope of Service</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Provision</strong> – We provide dashboards, scheduled and on‑demand reports, data visualizations, and integrations with third‑party platforms.</li>
                            <li><strong>Changes</strong> – We may modify, suspend, or discontinue features at any time. Material changes will be communicated where practicable.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">5. User Obligations and Acceptable Use</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Lawful Use</strong> – Use the Service only for lawful purposes and in compliance with applicable laws and third‑party terms.</li>
                            <li><strong>Third‑Party Accounts</strong> – When you connect third‑party accounts (e.g., Google, Facebook), you represent that you have the right to grant access and that your use complies with those providers' policies.</li>
                            <li><strong>Prohibited Conduct</strong> – Do not reverse‑engineer the Service, interfere with operations, attempt unauthorized access, scrape data beyond provided APIs, or use the Service to infringe others' rights.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">6. Data Access, Permissions, and Integrations</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>OAuth and API Access</strong> – By connecting third‑party accounts you authorize GC Analytics to access data via OAuth or API tokens to generate reports.</li>
                            <li><strong>Scope of Access</strong> – We request only the permissions necessary to provide the Service. You may revoke access via the third‑party provider, but revocation may limit functionality.</li>
                            <li><strong>Responsibility</strong> – You are responsible for the permissions you grant and for complying with third‑party platform rules.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Our Rights</strong> – Greycats Tech LLP retains all rights, title, and interest in the Service, software, and documentation.</li>
                            <li><strong>Your Rights</strong> – You retain ownership of Client Data. You grant us a limited, non‑exclusive, worldwide license to use, store, and process Client Data to provide the Service.</li>
                            <li><strong>Feedback</strong> – Feedback you provide may be used by us under a perpetual, worldwide, royalty‑free license.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">8. Fees and Payment</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Pricing</strong> – Fees, billing cycles, and payment methods are set on our pricing page or in a separate agreement.</li>
                            <li><strong>Nonpayment</strong> – We may suspend or terminate Accounts for nonpayment after notice.</li>
                            <li><strong>Taxes</strong> – You are responsible for applicable taxes unless otherwise stated.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">9. Termination and Suspension</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>By You</strong> – You may close your Account at any time; termination does not relieve you of outstanding fees.</li>
                            <li><strong>By Us</strong> – We may suspend or terminate Accounts for breach, illegal activity, or security concerns with notice where practicable.</li>
                            <li><strong>Effect</strong> – On termination we will stop providing the Service. Client Data may be deleted or anonymized after the retention period described in the Privacy Policy.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">10. Warranties and Disclaimers</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>No Warranty</strong> – The Service is provided "as is" and "as available." We disclaim all warranties to the fullest extent permitted by law.</li>
                            <li><strong>Third‑Party Data</strong> – We do not warrant the accuracy or completeness of third‑party data integrated into the Service.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
                        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                            <li><strong>Cap on Liability</strong> – To the maximum extent permitted by law, our aggregate liability for claims arising from these Terms will not exceed the fees paid by you in the 12 months preceding the claim.</li>
                            <li><strong>Exclusion of Damages</strong> – We are not liable for indirect, incidental, special, consequential, or punitive damages.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">12. Indemnification</h2>
                        <p className="leading-relaxed">
                            You agree to indemnify and hold Greycats Tech LLP and its affiliates harmless from
                            claims, losses, liabilities, and expenses arising from your use of the Service, violation of
                            these Terms, or infringement of third‑party rights.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">13. Confidentiality</h2>
                        <p className="leading-relaxed">
                            Each party will protect the other's confidential information with reasonable care and
                            will not disclose it except as required by law or to provide the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">14. Governing Law and Dispute Resolution</h2>
                        <p className="leading-relaxed">
                            These Terms are governed by the laws of India. Disputes will be resolved in the courts
                            located in Mumbai, Maharashtra, India.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">15. Changes to Terms</h2>
                        <p className="leading-relaxed">
                            We may update these Terms. We will post the updated Terms on{" "}
                            <Link to="/terms-of-service" className="text-primary underline">
                                https://analytics.greycats.tech/terms
                            </Link>{" "}
                            and notify you of material changes. Continued use after notice constitutes acceptance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">16. Contact</h2>
                        <p className="leading-relaxed">
                            For questions about these Terms contact{" "}
                            <a href="mailto:info@greycats.tech" className="text-primary underline">info@greycats.tech</a>{" "}
                            or visit{" "}
                            <Link to="/contact" className="text-primary underline">
                                https://analytics.greycats.tech/contact
                            </Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
