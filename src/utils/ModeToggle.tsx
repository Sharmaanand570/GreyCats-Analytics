"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";


export function ModeToggle() {
const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
   
  };

  return (
    <Button onClick={toggleTheme}>
     {theme === "dark" ? <Sun className="all-transition rotate-90 duration-300" /> : <Moon className="all-transition rotate-90 duration-300" />}


      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
