//App.js
import React, { useState } from "react";
import Roster from "./Roster";
import Payroll from "./Payroll";

function App() {
  const [selectedMenu, setSelectedMenu] = useState("roster");

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  return (
    <div className="flex min-h-screen">
      {/* Side Menu */}
      <aside className="fixed top-0 bottom-0 px-3 py-4 overflow-y-auto flex-shrink-0 bg-gray-100 border-r border-gray-200">
        {/* Logo */}
        <div className="p-4 flex items-center justify-center mb-10">
          <img src="logo.png" alt="Logo" className="h-10" />
        </div>
        {/* Menu Items */}
        <ul className="space-y-2 font-medium">
          <li
            className={`hover:bg-blue-100 rounded-lg flex items-center cursor-pointer py-2 px-4 ${
              selectedMenu === "roster"
                ? "bg-blue-400 text-white hover:bg-blue-400"
                : ""
            }`}
            onClick={() => handleMenuClick("roster")}
          >
            <svg
              className="w-5 h-5 mr-2 text-white transition duration-75 dark:text-gray-400 group-hover:text-white dark:group-hover:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill={selectedMenu === "roster" ? "currentColor" : "gray"}
              viewBox="0 0 22 21"
            >
              <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
              <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
            </svg>
            Roster
          </li>

          <li
            className={`hover:bg-blue-100 rounded-lg flex items-center cursor-pointer py-2 px-4 ${
              selectedMenu === "payroll"
                ? "bg-blue-400 text-white hover:bg-blue-400"
                : ""
            }`}
            onClick={() => handleMenuClick("payroll")}
          >
            <svg
              className="w-5 h-5 mr-2 text-white transition duration-75 dark:text-gray-400 group-hover:text-white dark:group-hover:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill={selectedMenu === "payroll" ? "currentColor" : "gray"}
              viewBox="0 0 20 20"
            >
              <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
              <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
              <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
            </svg>
            Allowance
          </li>
          
        </ul>
        
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 ml-[230px]">
        <div className="p-4">
          {" "}
          {/* Adjust padding as needed */}
          {selectedMenu === "roster" && <Roster />}
          {selectedMenu === "payroll" && <Payroll />}
        </div>
      </main>
    </div>
  );
}

export default App;
