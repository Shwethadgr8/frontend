import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const Roster = () => {
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await axios.get("/modified_roster.xlsx", {
          responseType: "arraybuffer",
        });

        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Add empty cells before Morning, Afternoon, and Night headers
        const modifiedData = jsonData.map((row) => {
          return ["", ...row];
        });

        setExcelData(modifiedData);
      } catch (error) {
        console.error("Error fetching Excel file:", error);
      }
    };

    fetchExcelData();
  }, []);

  // Helper function to determine background color based on cell value
  const getCellBackgroundColor = (cellValue) => {
    switch (cellValue) {
      case "A":
        return "bg-yellow-300"; // Yellow background for "A"
      case "M":
        return "bg-green-300 hover:bg-green-300"; // Green background for "M"
      case "N":
        return "bg-blue-300 hover:bg-blue-300"; // Blue background for "N"
      case "O":
        return "bg-red-300 hover:bg-red-300"; // Red background for "O"
      case "G":
        return "bg-gray-300";
      case "Sat":
        return "bg-neutral-300";
      case "Sun":
        return "bg-neutral-300";
      case "L":
        return "bg-orange-400"; 
      default:
        return ""; // Default background color
    }
  };

  // Helper function to determine text color based on cell value
  const getCellTextColor = (cellValue) => {
    return cellValue === 0 ? "text-white" : "";
  };

  return (
    <div className="container mx-auto p-4">
      {excelData !== null && excelData.length > 0 ? (
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {excelData[0].slice(1).map((cell, index) => (
                  <th key={index} className="px-6 py-3 border border-gray-800">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="bg-white border-b border-gray-800 dark:bg-gray-800 dark:border-gray-700"
                >
                  {row.slice(1).map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-1 py-1 border text-gray-900 border-gray-800 whitespace-nowrap ${getCellBackgroundColor(
                        cell
                      )} ${getCellTextColor(cell)}`} // Apply text color class
                    >
                      {cell !== null ? cell : "Infeasible"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          role="status"
          className="max-w-xl p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
        >
          <span className="text-blue-500 text-xl">Infeasible...</span>
        </div>
      )}
    </div>
  );

};

export default Roster;