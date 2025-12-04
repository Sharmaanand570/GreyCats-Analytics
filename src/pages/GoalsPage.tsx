import PagesEmptyPlaceHolder from "@/components/PagesEmptyPlaceHolder";
import React from "react";
import { FaBullseye } from "react-icons/fa6";
import { MdOutlineTrackChanges } from "react-icons/md";

function GoalsPage(): React.JSX.Element {
  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Goals</span>
          </div>

          <div className="flex flex-1 justify-center px-8 items-center">
            <PagesEmptyPlaceHolder
              Header={"No Goals Yet!"}
              subHeader="Track your progress and stay motivated by setting measurable goals."
              pointers={[
                "Define your objectives clearly",
                "Monitor your daily or weekly progress",
                "Achieve milestones with consistency",
              ]}
              smallIcon={FaBullseye}
              bigIcon={MdOutlineTrackChanges}
              buttonText="Create Goal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoalsPage;
