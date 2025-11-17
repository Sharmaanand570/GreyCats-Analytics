import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";
import TableComponent from "./TableComponent";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import { SiGoogleads, SiGoogleanalytics } from "react-icons/si";
import ConnectDataSource from "./ConnectDataSource";

function Integrations() {
  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Data Sources</span>
            <div className="flex items-center">
              <span className="mx-2 text-lg text-gray-500">
                <FiSearch />
              </span>
              <span className="mx-2 text-lg text-gray-500 ">
                {" "}
                <FiBell />
              </span>
              <span className="ml-4">
                <ConnectDataSource>
                  <Button className="rounded-[0.4rem]">
                    Connect Data Source
                  </Button>
                </ConnectDataSource>
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
                "Integration",
                "Label",
                "Identifier",
                "Clients Connected",
                "Status",
              ]}
              bodyData={[
                {
                  name: "Facebook",
                  icon: FaFacebook,
                  link: "/integrations/facebook",
                  label: "Abhishek Waghmare",
                  identifier: "122125436060189474",
                  clientsConnected: 6,
                  status: "Connected",
                },
                {
                  name: "Instagram",
                  icon: FaInstagram,
                  link: "/integrations/instagram",
                  label: "Abhishek Waghmare",
                  identifier: "122125436060189474",
                  clientsConnected: 6,
                  status: "Connected",
                },
                {
                  name: "Google Ads",
                  icon: SiGoogleads,
                  link: "/integrations/google-ads",
                  label: "Team",
                  identifier: "104147153338746995797",
                  clientsConnected: 1,
                  status: "Connected",
                },
                {
                  name: "Google Analytics 4",
                  icon: SiGoogleanalytics,
                  link: "/integrations/google-analytics",
                  label: "Team Antagon",
                  identifier: "104147153338746995797",
                  clientsConnected: 1,
                  status: "Connected",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Integrations;
