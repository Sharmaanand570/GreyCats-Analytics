import { FiSearch, FiBell } from "react-icons/fi";
import { Button } from "./ui/button";
import { ChartLineMultiple } from "./ChartLineMultiple";
import { ChartPieInteractive } from "./ChartPieInteractive";
import { getChangeIndicatorClass } from "../utils/statusColors";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        {/* Header */}
        <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-4 sm:px-5">
          <span className="font-medium text-lg sm:text-xl">Dashboard</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <FiSearch className="text-lg text-gray-500 cursor-pointer" />
            <FiBell className="text-lg text-gray-500 cursor-pointer" />
            <Link to={"/edit-dashboard"}><Button className="rounded-md text-xs sm:text-sm md:text-base">
              Edit Dashboard
            </Button></Link>
          </div>
        </div>
        {/* edit-dashobard */}
        {/* Stats Cards */}
        <div className="w-full flex flex-wrap gap-3 sm:gap-4 px-3 sm:px-5 py-4">
          {/* Card */}
          {[
            {
              title: "Total Ad Spend",
              value: "$45,231.89",
              change: "+2.5% vs last month",
              isPositive: true,
            },
            {
              title: "Total Clicks",
              value: "1.2M",
              change: "+10.1% vs last month",
              isPositive: true,
            },
            {
              title: "Conversions",
              value: "8,450",
              change: "-1.2% vs last month",
              isPositive: false,
            },
            {
              title: "Avg. CPC",
              value: "$0.82",
              change: "-$0.05 vs last month",
              isPositive: false,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-[12rem] sm:min-w-[10rem] md:min-w-[12rem] lg:min-w-[14rem] xl:min-w-[16rem] bg-gradient-to-tr from-[#F3F3F3] to-white rounded-2xl border flex flex-col justify-center p-4 sm:p-5 md:p-6"
            >
              <span className="text-xs sm:text-sm text-gray-500">
                {card.title}
              </span>
              <span className="text-xl sm:text-2xl md:text-[1.6rem] font-semibold my-1">
                {card.value}
              </span>
              <span
                className={`text-xs sm:text-sm ${getChangeIndicatorClass(
                  card.isPositive
                )}`}
              >
                {card.change}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="w-full px-3 sm:px-5 pb-6 flex flex-col lg:flex-row gap-6">
          {/* Line Chart */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl border p-3 sm:p-4">
            <ChartLineMultiple />
          </div>

          {/* Pie Chart */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl border p-3 sm:p-4">
            <ChartPieInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
