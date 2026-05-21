import { FiSearch } from "react-icons/fi";
import { NotificationsPopover } from './NotificationsPopover';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";
import TableComponent from "./TableComponent";

function Clients() {
  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Clients</span>
            <div className="flex items-center">
              <span className="mx-2 text-lg text-gray-500">
                <FiSearch />
              </span>
              <span className="mx-2">
                <NotificationsPopover />
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
              header={["Client", "FB Likes", "FB Trend", "GA Clicks", "GA Trend"]}
              bodyData={[
                {
                  id: 1,
                  profile: {
                    name: "Nike",
                    website: "www.nike.com",
                    icon: "https://cdn-icons-png.flaticon.com/512/731/731962.png",
                  },
                  FBLikes: 18199,
                  FBTrend: 21000,
                  GAClicks: 17500,
                  GATrend: 18250,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clients;
