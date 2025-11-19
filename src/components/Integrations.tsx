import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import DropDownFilter from "./DropDownFilter";
import TableComponent from "./TableComponent";
import ConnectDataSource from "./ConnectDataSource";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig, capitalizeStatus } from "@/utils/platformMapping";
import { useMemo } from "react";
import { Skeleton } from "./ui/skeleton";

function Integrations() {
  const {
    data: integrationsData,
    isLoading,
    error,
  } = useIntegrations();

  console.log(integrationsData,error)

  const tableData = useMemo(() => {
    if (!integrationsData?.integrations) {
      return [];
    }

    return integrationsData.integrations.map((integration) => {
      const platformConfig = getPlatformConfig(integration.platform);
      
      return {
        name: platformConfig?.name || integration.platform,
        icon: platformConfig?.icon,
        link: platformConfig?.link || `/integrations/${integration.platform}`,
        label: integration.accountName,
        identifier: integration.accountId,
        clientsConnected: 1, // Default value, can be updated if API provides this
        status: capitalizeStatus(integration.status),
      };
    });
  }, [integrationsData]);

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
            {isLoading ? (
              <div className="border w-full rounded-[0.7rem] overflow-hidden p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : error ? (
              <div className="border w-full rounded-[0.7rem] overflow-hidden p-6">
                <div className="text-destructive">
                  <p className="font-medium">Failed to load integrations</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error
                      ? error.message
                      : "An error occurred while fetching integrations"}
                  </p>
                </div>
              </div>
            ) : (
              <TableComponent
                header={[
                  "Integration",
                  "Label",
                  "Identifier",
                  "Clients Connected",
                  "Status",
                ]}
                bodyData={tableData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Integrations;
