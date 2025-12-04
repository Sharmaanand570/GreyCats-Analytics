import PagesEmptyPlaceHolder from "@/components/PagesEmptyPlaceHolder";
import React from "react";
import { FaTasks } from "react-icons/fa";

import { PiListStarLight } from "react-icons/pi";

function TasksPage(): React.JSX.Element {
  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Tasks</span>
          </div>

          <div className="flex flex-1 justify-center  items-center">
            <PagesEmptyPlaceHolder
              Header={"Effortless Agency Management"}
              subHeader="Streamline your agency's workflows and boost productivity at scale with simplified task management."
              pointers={[
                "Create and assign new tasks",
                "Schedule repeat and recurring tasks",
                "Report on completed tasks",
              ]}
              smallIcon={FaTasks}
              bigIcon={PiListStarLight}
              buttonText="Create Task"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
