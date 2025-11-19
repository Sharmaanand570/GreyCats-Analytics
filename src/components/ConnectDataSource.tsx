import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckBoxInput } from "./CheckBoxInput";
import type { IconType } from "react-icons";
import { FaFacebook, FaGoogle, FaYoutube } from "react-icons/fa6";
import React from "react";
import { useYouTubeConnect } from "@/features/YouTube/hooks/useYouTubeConnect";
import { toast } from "sonner";
import { useGoogleConnect } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { useGoogleConsoleConnect } from "@/features/YouTube/hooks/google/useGoogleConsoleConnect";

type ConnectDataSourceType = {
  children: React.ReactNode;
};

type DataSourceOption = {
  id: string | number;
  name: string | string;
  icon: IconType | string;
};

const dataSourceOptions: DataSourceOption[] = [
  { id: "google-analytics", name: "google Analytics", icon: FaGoogle },
  { id: "google-console", name: "Google Console", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "youtube", name: "YouTube", icon: FaYoutube },
];

function ConnectDataSource({
  children,
}: ConnectDataSourceType): React.JSX.Element {
  const [Next, setNext] = React.useState(false);
  const [SelectedSource, setSelectedSource] = React.useState<DataSourceOption>({
    id: 0,
    name: "",
    icon: "",
  });
  const { mutateAsync: connectYouTube, isPending: isConnecting } =
    useYouTubeConnect();
  const { mutateAsync: connectGoogle, isPending: isConnectingGoogle } =
    useGoogleConnect();
  const { mutateAsync: connectGoogleConsole, isPending: isConnectingGoogleConsole } =
    useGoogleConsoleConnect();

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="lg:max-w-[60vw] lg:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select a Data Source</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {!Next ? (
            <form>
              {/* Top Controls */}
              <div className="flex justify-between space-x-6 mt-4 p-3 rounded">
                <div className="w-[40%]">
                  <Input id="data-source-name" placeholder="Data Source Name" />
                </div>

                <div className="flex w-[60%] justify-between">
                  <div className="flex w-1/2 space-x-2">
                    <Button>All (20)</Button>
                    <Button>New (2)</Button>
                    <Button>Popular (12)</Button>
                  </div>

                  <div className="flex w-1/2 justify-end">
                    <CheckBoxInput />
                  </div>
                </div>
              </div>

              {/* SCROLL AREA */}
              <div className="mt-4 h-[400px] overflow-y-scroll pr-2">
                <div className="grid grid-cols-3 gap-3">
                  {dataSourceOptions.map((option) => (
                    <div
                      onClick={() => setSelectedSource(option)}
                      id={String(option.id)}
                      key={String(option.id)}
                      className={`flex items-center p-4 rounded-md border hover:bg-slate-100 cursor-pointer ${
                        String(SelectedSource.id) === String(option.id)
                          ? "bg-slate-100 border-slate-300"
                          : ""
                      }`}
                    >
                      <option.icon className="mr-2 h-6 w-6 text-slate-800" />
                      {option.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!SelectedSource.name) {
                      toast.error("Please select a data source");
                      return;
                    }
                    // If YouTube is selected, initiate OAuth flow
                    if (SelectedSource.id === "youtube") {
                      try {
                        const response = await connectYouTube();
                        if (response.success && response.url) {
                          window.location.href = response.url;
                        }
                      } catch (error) {
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect YouTube";
                        toast.error(errorMessage);
                      }
                    } else if (SelectedSource.id === "google-analytics") {
                      try {
                        const response = await connectGoogle();
                        if (response.success && response.url) {
                          window.location.href = response.url;
                        }
                      } catch (error) {
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect Google Analytics";
                        toast.error(errorMessage);
                      }
                    } else if (SelectedSource.id === "google-console") {
                      try {
                        const response = await connectGoogleConsole();
                        if (response.success && response.url) {
                          window.location.href = response.url;
                        }
                      } catch (error) {
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect Google Console";
                        toast.error(errorMessage);
                      }
                    } else {
                      // For other sources, just go to next step
                      setNext((prev) => !prev);
                    }
                  }}
                  disabled={
                    isConnecting || !SelectedSource.name || isConnectingGoogle || isConnectingGoogleConsole
                  }
                  type="button"
                >
                  {isConnecting || isConnectingGoogle || isConnectingGoogleConsole
                    ? "Connecting..."
                    : "Next"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div>
              <div>
                <div className="w-full flex justify-center flex-col items-center ">
                  <div className="flex items-center gap-2 py-6">
                    {SelectedSource.icon &&
                      typeof SelectedSource.icon !== "string" && (
                        <SelectedSource.icon className="text-5xl" />
                      )}
                    <span className="text-4xl">{SelectedSource.name}</span>
                  </div>

                  <div className="w-full h-[350px] bg-accent overflow-y-scroll"></div>

                  <div className="w-full ">
                    <Button className="mt-6 bg-accent border text-accent-foreground w-full rounded-[0.4rem]">
                      + Add Account
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="mt-4  flex justify-between w-full ">
                <Button
                  onClick={() => setNext((prev) => !prev)}
                  variant="outline"
                >
                  Back
                </Button>

                <Button className="flex-1" type="submit">
                  Connect
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* -------------------------------------------------------------------------- */}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConnectDataSource;
