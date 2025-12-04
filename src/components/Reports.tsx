import { useMemo } from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import TableComponent from "./TableComponent";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteReportTemplate, listReportTemplates } from "@/features/reports/api/reportingApi";
import type { ReportTemplateSummary } from "@/features/reports/api/types";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const TABLE_HEADERS = [
  "Name",
  "Created",
  "Default From",
  "Default To",
  "Schedule",
  "Schedule Status",
  "Last Sent",
  "Next Send Date",
  "Awaiting Approval",
  "Last Sent Status",
  "Actions",
];

function mapTemplateToRow(template: ReportTemplateSummary) {
  return {
    id: template.id,
    name: template.name,
    client: "—",
    type: "Template",
    created: template.createdAt
      ? new Date(template.createdAt).toLocaleDateString()
      : "—",
    clientGroup: "—",
    defaultFrom: template.defaultDateFrom
      ? new Date(template.defaultDateFrom).toLocaleDateString()
      : "—",
    defaultTo: template.defaultDateTo
      ? new Date(template.defaultDateTo).toLocaleDateString()
      : "—",
    schedule: "Manual",
    scheduleStatus: "Draft",
    lastSent: "—",
    nextSendDate: "—",
    awaitingApproval: false,
    lastSentStatus: "Draft",
  };
}

function Reports() {
  const {
    data: rawTemplates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["report-templates", "list"],
    queryFn: async () => {
      const response = await listReportTemplates();
      return response.templates ?? [];
    },
  });


  const templates = (rawTemplates ?? []) as ReportTemplateSummary[];

  const { mutate: deleteTemplate } = useMutation({
    mutationFn: async (id: number) => {
      await deleteReportTemplate(id);
    },
    onSuccess: () => {
      toast.success("Report template deleted");
      void refetch();
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to delete report template";
      toast.error(message);
    },
  });

  const tableRows = useMemo(() => {
    if (!templates.length) return [];
    return templates.map((template) => ({
      ...mapTemplateToRow(template),
      onDelete: () => deleteTemplate(template.id),
    }));
  }, [templates, deleteTemplate]);

  const showTable = tableRows.length > 0;

  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Reports</span>
            <div className="flex items-center">
              <span className="mx-2 text-lg text-gray-500">
                <FiSearch />
              </span>
              <span className="mx-2 text-lg text-gray-500 ">
                {" "}
                <FiBell />
              </span>
              <span className="ml-4">
                <Link to="/reports/new">
                  <Button className="rounded-[0.4rem]">Create Report</Button>
                </Link>
              </span>
            </div>
          </div>

          <div className="w-full justify-between items-center flex px-5">
            <div className="flex w-[30%]  gap-3 py-6">
              <div className="w-[60%]">
                <Input
                  className="w-full rounded-[0.5rem] p-4 py-5"
                  type="email"
                  placeholder="Email"
                />
              </div>

              <div>
                <DropDownFilter />
              </div>
            </div>
            <div>
              {/* <Button className="rounded-[0.5rem]"> Add Client</Button> */}
            </div>
          </div>
          <div className="w-full px-5">
            {isLoading && (
              <div className="w-full border rounded-2xl py-16 flex flex-col items-center justify-center text-gray-500 text-sm">
                Loading reports...
              </div>
            )}
            {!isLoading && isError && (
              <div className="w-full border rounded-2xl py-16 flex flex-col items-center justify-center text-gray-500 text-sm gap-4">
                <span>Unable to load reports right now.</span>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            )}
            {!isLoading && !isError && showTable && (
              <TableComponent header={TABLE_HEADERS} bodyData={tableRows} />
            )}
            {!isLoading && !isError && !showTable && (
              <div className="w-full border border-dashed rounded-2xl py-16 flex flex-col items-center justify-center text-center px-6 gap-4 bg-gradient-to-br from-white to-zinc-50">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    No reports yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Create a template in the builder or connect an integration to
                    start generating reports.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link to="/reports/new">
                    <Button>Create Report</Button>
                  </Link>
                  <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
