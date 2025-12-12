import PagesEmptyPlaceHolder from '@/components/PagesEmptyPlaceHolder'
import React from 'react'
import TableComponent from '@/components/TableComponent'

import { FaBell } from 'react-icons/fa6'
import { MdOutlineNotificationsActive } from 'react-icons/md'

type AlertRow = {
  metric: string;
  client: string;
  currentValue: string | number;
  triggerValue: string | number;
  interval: string;
  lastTriggered: string;
};

function AlertsPage(): React.JSX.Element {
  // TODO: Replace with actual data from API/state
  const alertsData: AlertRow[] = [
    {
      metric: "Page Views",
      client: "Acme Corp",
      currentValue: 12500,
      triggerValue: 10000,
      interval: "Daily",
      lastTriggered: "2024-01-15 14:30"
    },
    {
      metric: "Conversion Rate",
      client: "TechStart Inc",
      currentValue: "3.2%",
      triggerValue: "2.5%",
      interval: "Weekly",
      lastTriggered: "2024-01-14 09:15"
    },
    {
      metric: "Bounce Rate",
      client: "Global Solutions",
      currentValue: "45%",
      triggerValue: "40%",
      interval: "Daily",
      lastTriggered: "2024-01-15 11:20"
    },
    {
      metric: "Revenue",
      client: "E-commerce Plus",
      currentValue: "₹15,500",
      triggerValue: "₹12,000",
      interval: "Weekly",
      lastTriggered: "2024-01-13 16:45"
    },
    {
      metric: "Active Users",
      client: "Social Media Hub",
      currentValue: 8500,
      triggerValue: 8000,
      interval: "Daily",
      lastTriggered: "2024-01-15 08:00"
    },
    {
      metric: "Session Duration",
      client: "Content Creators",
      currentValue: "4m 32s",
      triggerValue: "3m 00s",
      interval: "Weekly",
      lastTriggered: "2024-01-12 13:10"
    }
  ];

  const headers = ["Metric", "Client", "Current Value", "Trigger Value", "Interval", "Last Triggered"];

  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Alerts</span>

          </div>

          {alertsData.length === 0 ? (
            <div className="flex flex-1 justify-center  items-center">
              <PagesEmptyPlaceHolder
                Header={"No Alerts Yet!"}
                subHeader="Stay informed with instant updates and notifications."
                pointers={["Set up custom alerts", "Get real-time updates", "Stay ahead always"]}
                smallIcon={FaBell}
                bigIcon={MdOutlineNotificationsActive}
                buttonText="Create Alert"
              />
            </div>
          ) : (
            <div className="flex-1 p-5">
              <TableComponent header={headers} bodyData={alertsData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
