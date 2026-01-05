import { useParams } from "react-router-dom";
import ReportBuilder from "./ReportBuilder";

function SharedReportPage() {
    const { id } = useParams<{ id: string }>();
    const reportId = id ? parseInt(id) : undefined;

    if (!reportId || isNaN(reportId)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-500">Invalid Report Link</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <ReportBuilder readOnly={true} providedReportId={reportId} />
        </div>
    );
}

export default SharedReportPage;
