import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
            </header>

            {/* PDF Viewer */}
            <div className="flex-1">
                <iframe
                    src="/privacy-policy.pdf"
                    title="GC Analytics Privacy Policy"
                    className="w-full h-full"
                    style={{ minHeight: "calc(100vh - 57px)", border: "none" }}
                />
            </div>
        </div>
    );
}
