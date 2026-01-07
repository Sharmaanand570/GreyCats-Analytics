import { useParams, useSearchParams } from "react-router-dom";
import ReportBuilder from "./ReportBuilder";
import { useEffect, useState } from "react";
import { getReportTemplate } from "@/features/reports/api/reportingApi";
import { Loader2, ShieldAlert, FileX, Lock } from "lucide-react";

function SharedReportPage() {
    const { id } = useParams<{ id: string }>();
    const reportId = id ? parseInt(id) : undefined;

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || undefined;

    const [reportData, setReportData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            // 1. Validate Token Exists Locally
            if (!token) {
                console.error("❌ [SharedReport] Token missing from URL");
                setError("Share token is missing");
                setLoading(false);
                return;
            }

            if (!reportId || isNaN(reportId)) {
                setError("Invalid Report Link");
                setLoading(false);
                return;
            }

            try {
                // 2. Call Backend to Validate Token & Fetch Data
                // The getReportTemplate function (in reportingApi.ts) handles the API call
                // and throws an error if the status is not 200 OK.
                const response = await getReportTemplate(reportId, token);

                if (response.success && (response.template || (response as any).data)) {
                    // Success: Set the report data
                    // We handle both direct .template or nested .data structure here just in case,
                    // though getReportTemplate normalizes it.
                    setReportData(response.template);
                } else {
                    setError("Failed to load report data");
                }
            } catch (err: any) {
                console.error("❌ [SharedReport] Validation Failed:", err);
                const status = err.status || err.response?.status;

                // 3. Handle Specific Security Error Codes
                if (status === 410) {
                    setError("This share link has expired (15 days old)");
                } else if (status === 404 || status === 401 || status === 403) {
                    setError("Report not found or invalid share token");
                } else {
                    setError("Failed to load report or network error");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [reportId, token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <h3 className="text-lg font-medium text-slate-900">Securely Loading Report</h3>
                        <p className="text-sm text-slate-500">Verifying access token...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        let icon = <ShieldAlert className="w-12 h-12 text-red-500" />;
        let title = "Access Denied";

        if (error.includes("expired")) {
            icon = <FileX className="w-12 h-12 text-amber-500" />;
            title = "Link Expired";
        } else if (error.includes("missing") || error.includes("invalid")) {
            icon = <Lock className="w-12 h-12 text-slate-500" />;
            title = "Authentication Required";
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md w-full text-center border border-white/50">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-slate-50 rounded-full shadow-inner ring-1 ring-slate-100">
                            {icon}
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-600 leading-relaxed mb-8 border-t border-slate-100 pt-4 mt-4">
                        {error}
                    </p>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                        Secure Report Viewer
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-slate-50">
            <ReportBuilder
                readOnly={true}
                providedReportId={reportId}
                shareToken={token}
                initialData={reportData}
            />
        </div>
    );
}

export default SharedReportPage;
