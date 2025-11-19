import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import TableComponent from "./TableComponent";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";

function Reports() {
  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-5 ">
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
                <Button className="rounded-[0.4rem]">Edit Dashboard</Button>
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
            <TableComponent
              header={[
                "Name",
                "Client",
                "Type",
                "Created",
                "Schedule",
                "Schedule Status",
                "Client Group",
                "Last Sent",
                "Next Send Date",
                "Awaiting Approval",
                "Last Sent Status",
              ]}
              bodyData={[
                {
                  name: "Monthly Performance Report",
                  client: "Acme Corp",
                  type: "Analytics",
                  created: "2025-10-12",
                  schedule: "Monthly",
                  scheduleStatus: "Active",
                  clientGroup: "Enterprise",
                  lastSent: "2025-10-01",
                  nextSendDate: "2025-11-01",
                  awaitingApproval: false,
                  lastSentStatus: "Delivered",
                },
                {
                  name: "Social Media Insights",
                  client: "Bright Studio",
                  type: "Marketing",
                  created: "2025-09-20",
                  schedule: "Weekly",
                  scheduleStatus: "Paused",
                  clientGroup: "Agency",
                  lastSent: "2025-10-30",
                  nextSendDate: "2025-11-07",
                  awaitingApproval: true,
                  lastSentStatus: "Pending",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
