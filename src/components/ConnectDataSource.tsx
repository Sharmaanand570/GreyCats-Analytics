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
import { Label } from "@/components/ui/label";
import { CheckBoxInput } from "./CheckBoxInput";
import type { IconType } from "react-icons";
import { FaFacebook, FaGoogle, FaInstagram } from "react-icons/fa6";
import { data } from "react-router-dom";
import React from "react";

type ConnectDataSourceType = {
  children: React.ReactNode;
};

type DataSourceOption = {
  id: string;
  name: string;
  icon: IconType;
};

const dataSourceOptions: DataSourceOption[] = [
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
  { id: "google-ads", name: "Google Ads", icon: FaGoogle },
  { id: "facebook", name: "Facebook", icon: FaFacebook },
  { id: "instagram", name: "Instagram", icon: FaInstagram },
];

function ConnectDataSource({
  children,
}: ConnectDataSourceType): React.JSX.Element {
  const [Next, setNext] = React.useState(false);

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
                    onClick={()=> setNext(true)}
                      id={option.id}
                      key={option.id}
                      className="flex items-center p-4 rounded-md border hover:bg-slate-100 cursor-pointer"
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
                <Button onClick={() => setNext((prev) => !prev)} type="submit">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div>
              <div>
                <div className="w-full flex justify-center flex-col items-center ">
                  <div className="flex items-center gap-2 py-6">
                    <FaInstagram className="text-5xl" />
                    <span className="text-4xl">Instagram</span>
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
              
                  <Button onClick={() => setNext((prev)=> !prev)} variant="outline">Back</Button>
               
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
