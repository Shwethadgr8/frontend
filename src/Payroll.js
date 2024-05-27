import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const Payroll = () => {
  const [excelData, setExcelData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filterNames, setFilterNames] = useState([]);
  const [filterOptions, setFilterOptions] = useState(["All"]);
  const [total, setTotal] = useState(null);
  const [totalM, setTotalM] = useState(null);
  const [totalA, setTotalA] = useState(null);
  const [totalN, setTotalN] = useState(null);
  const [nameColumnIndex, setNameColumnIndex] = useState(-1);
  const [headerRow, setHeaderRow] = useState([]);
  const [shiftCounts, setShiftCounts] = useState({
    morning: 0,
    afternoon: 0,
    night: 0,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  const downloadReport = () => {
    if (filteredData) {
      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...filteredData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payroll Report");
      XLSX.writeFile(wb, "allowance_report.xlsx");
    }
  };

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await axios.get("/Payroll.xlsx", {
          responseType: "arraybuffer",
        });

        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const filteredOptions = filterOptions.filter(
          (option) => option !== "All"
        );

        const headerRowData = jsonData[0];
        const nameColumnIndexData = headerRowData.indexOf("Employee Name");
        setHeaderRow(headerRowData);
        setNameColumnIndex(nameColumnIndexData);

        const namesSet = new Set();
        jsonData.forEach((row) => {
          const name = row[nameColumnIndexData];
          if (
            name &&
            typeof name === "string" &&
            name.trim() !== "Employee Name"
            
          ) {
            namesSet.add(name.trim());
          }
        });

        const uniqueNames = ["All", ...Array.from(namesSet)];

        setExcelData(jsonData);
        setFilterOptions(uniqueNames);

        // Exclude the first row initially
        setFilteredData(jsonData.slice(1));
        

        // Calculate totals based on the filtered data
        calculateTotals(jsonData);

        calculateInitialTotals(jsonData);
      } catch (error) {
        console.error("Error fetching Excel file:", error);
      }
    };

    fetchExcelData();
  }, []);

  useEffect(() => {
    // Calculate shift counts whenever filteredData or filterNames changes
    if (filteredData && filterNames.length > 0) {
      calculateShiftCounts(filteredData);
    }
  }, [filteredData, filterNames]);

  const calculateShiftCounts = (data) => {
    let morningCount = 0;
    let afternoonCount = 0;
    let nightCount = 0;

    data.forEach((row) => {
      const allowanceTypeIndex = headerRow.indexOf("Allowance Type");
      if (allowanceTypeIndex !== -1) {
        const allowanceType = row[allowanceTypeIndex]?.toLowerCase();
        if (allowanceType.includes("morning")) {
          morningCount++;
        } else if (allowanceType.includes("afternoon")) {
          afternoonCount++;
        } else if (allowanceType.includes("night")) {
          nightCount++;
        }
      }
    });

    setShiftCounts({
      morning: morningCount,
      afternoon: afternoonCount,
      night: nightCount,
    });
  };

  const calculateTotals = (data) => {
    let totalAmount = 0,
      totalM = 0,
      totalA = 0,
      totalN = 0;

    if (data && data.length > 0 && nameColumnIndex !== -1) {
      data.forEach((row) => {
        const amountIndex = headerRow.indexOf("Amount as per policy");
        const allowanceTypeIndex = headerRow.indexOf("Allowance Type");

        // Check if indices are valid
        if (amountIndex !== -1 && allowanceTypeIndex !== -1) {
          const amount = parseFloat(row[amountIndex]);
          const allowanceType = row[allowanceTypeIndex]?.toLowerCase();

          // Calculate total amount
          totalAmount += amount;

          // Check for Morning, Afternoon, Night in Allowance Type
          if (allowanceType) {
            if (allowanceType.includes("morning")) {
              totalM += amount;
            } else if (allowanceType.includes("afternoon")) {
              totalA += amount;
            } else if (allowanceType.includes("night")) {
              totalN += amount;
            }
          }
        }
      });
    }

    setTotalM(totalM);
    setTotalA(totalA);
    setTotalN(totalN);

    // Calculate and set the total amount as the sum of totalM, totalA, and totalN
    setTotal(totalM + totalA + totalN);
  };
  const calculateInitialTotals = (data) => {
    let initialTotalAmount = 0,
      initialTotalM = 0,
      initialTotalA = 0,
      initialTotalN = 0;

    if (data && data.length > 0) {
      data.forEach((row) => {
        if (row.includes("Total amount for M")) {
          initialTotalM += parseFloat(
            row[row.indexOf("Total amount for M") + 1]
          );
        } else if (row.includes("Total amount for A")) {
          initialTotalA += parseFloat(
            row[row.indexOf("Total amount for A") + 1]
          );
        } else if (row.includes("Total amount for N")) {
          initialTotalN += parseFloat(
            row[row.indexOf("Total amount for N") + 1]
          );
        }
      });
    }

    initialTotalAmount = initialTotalM + initialTotalA + initialTotalN;
    setTotalM(initialTotalM);
    setTotalA(initialTotalA);
    setTotalN(initialTotalN);
    setTotal(initialTotalAmount);
  };

  const handleFilterChange = (selectedName) => {
    let updatedFilterNames = [...filterNames];

    if (selectedName === "All") {
      updatedFilterNames = [];
    } else {
      if (updatedFilterNames.includes(selectedName)) {
        updatedFilterNames = updatedFilterNames.filter(
          (name) => name !== selectedName
        );
      } else {
        updatedFilterNames.push(selectedName);
      }
    }

    setFilterNames(updatedFilterNames);

    if (updatedFilterNames.length === 0) {
      setFilteredData(excelData.slice(1)); // Exclude the first row
      calculateTotals(excelData);
    } else {
      const filtered = excelData.filter((row, index) => {
        if (index === 0) return false;
        const nameCellValue = row[nameColumnIndex]?.trim();
        return updatedFilterNames.includes(nameCellValue);
      });
      setFilteredData(filtered);
      calculateTotals(filtered);
    }
  };
  const filteredOptions = filterOptions.filter((option) => option !== "All");


  return (
    <div className="container mx-auto p-4">
      {/* Dashboard section */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex justify-center items-center mb-4">
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-7">
              <div className="bg-white  p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-400">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M2.87868 3.87868C2 4.75736 2 6.17157 2 9V15C2 17.8284 2 19.2426 2.87868 20.1213C3.75736 21 5.17157 21 8 21H16C18.8284 21 20.2426 21 21.1213 20.1213C22 19.2426 22 17.8284 22 15V9C22 6.17157 22 4.75736 21.1213 3.87868C20.2426 3 18.8284 3 16 3H8C5.17157 3 3.75736 3 2.87868 3.87868ZM16 8C16.5523 8 17 8.44772 17 9V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V9C15 8.44772 15.4477 8 16 8ZM9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11V17C7 17.5523 7.44772 18 8 18C8.55229 18 9 17.5523 9 17V11ZM13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13Z"
                      fill="#222222"
                    />
                  </svg>
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-gray-600">₹ {total}</p>
              </div>
              <div className="bg-white  p-5 rounded-lg">
                <p className="flex text-3xl font-bold text-gray-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-1"
                    x="0px"
                    y="0px"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                  >
                    <path d="M 11 0 L 11 3 L 13 3 L 13 0 L 11 0 z M 4.2226562 2.8085938 L 2.8085938 4.2226562 L 4.9296875 6.34375 L 6.34375 4.9296875 L 4.2226562 2.8085938 z M 19.777344 2.8085938 L 17.65625 4.9296875 L 19.070312 6.34375 L 21.191406 4.2226562 L 19.777344 2.8085938 z M 12 5 A 7 7 0 0 0 5 12 A 7 7 0 0 0 12 19 A 7 7 0 0 0 19 12 A 7 7 0 0 0 12 5 z M 0 11 L 0 13 L 3 13 L 3 11 L 0 11 z M 21 11 L 21 13 L 24 13 L 24 11 L 21 11 z M 4.9296875 17.65625 L 2.8085938 19.777344 L 4.2226562 21.191406 L 6.34375 19.070312 L 4.9296875 17.65625 z M 19.070312 17.65625 L 17.65625 19.070312 L 19.777344 21.191406 L 21.191406 19.777344 L 19.070312 17.65625 z M 11 21 L 11 24 L 13 24 L 13 21 L 11 21 z"></path>
                  </svg>
                  {filterNames.length > 0 && (
                    <span className=" -mt-[6px] ml-[10px]">
                      {shiftCounts.morning}
                    </span>
                  )}
                </p>
                <p className="flex text-sm font-medium text-blue-400">
                  Morning Shift
                </p>
                <p className="text-3xl  font-bold text-gray-600">₹ {totalM}</p>
              </div>
              <div className="bg-white  p-4 rounded-lg w-[210px]">
                <p className="flex text-3xl font-bold text-gray-800">
                  <svg
                    className="mb-2 "
                    width="30px"
                    height="30px"
                    viewBox="0 0 16 16"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#444"
                      d="M14 13c1.1 0 2-0.9 2-2s-0.9-2-2-2c0 0-0.1 0-0.1 0 0-0.3 0.1-0.6 0.1-1 0-2.2-1.8-4-4-4-0.8 0-1.5 0.2-2.2 0.6-0.3-0.9-1.2-1.6-2.3-1.6-1.4 0-2.5 1.1-2.5 2.5 0 0.6 0.2 1.1 0.6 1.6-0.2-0.1-0.4-0.1-0.6-0.1-1.7 0-3 1.3-3 3s1.3 3 3 3h11z"
                    ></path>
                  </svg>
                  {filterNames.length > 0 && (
                    <span className=" -mt-[6px] ml-[10px]">
                      {shiftCounts.afternoon}
                    </span>
                  )}
                </p>
                <p className="flex text-sm font-medium text-blue-400">
                  Afternoon Shift
                </p>
                <p className="text-3xl font-bold text-gray-600">₹ {totalA}</p>
              </div>
              <div className="bg-white  p-4 rounded-lg">
                <p className="flex  text-3xl  font-bold text-gray-800">
                  <svg
                    className="mb-2"
                    width="25"
                    height="25"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.7066 0.00274765C7.50391 -0.0027381 7.31797 0.114737 7.23588 0.300147C7.15379 0.485558 7.19181 0.702186 7.33213 0.848565C8.36577 1.92686 9.00015 3.3888 9.00015 4.99996C9.00015 8.31366 6.31385 11 3.00015 11C2.5757 11 2.16207 10.956 1.76339 10.8725C1.56489 10.8309 1.36094 10.9133 1.2471 11.0812C1.13325 11.249 1.13207 11.469 1.2441 11.638C2.58602 13.663 4.88682 15 7.50012 15C11.6423 15 15.0001 11.6421 15.0001 7.49996C15.0001 3.42688 11.7534 0.112271 7.7066 0.00274765Z"
                      fill="#000000"
                    />
                  </svg>
                  {filterNames.length > 0 && (
                    <span className=" -mt-[6px] ml-[10px]">
                      {shiftCounts.night}
                    </span>
                  )}
                </p>
                <p className="flex text-sm font-medium text-blue-400">
                  Night Shift
                </p>
                <p className="text-3xl font-bold text-gray-600">₹ {totalN}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-10">
        {/* Dropdown button */}
        <div className="relative">
          <button
            id="dropdownBgHoverButton"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-white bg-blue-400 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            Filter by Name{" "}
            <svg
              className="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-48 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-700">
              <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                {filteredOptions.map((name, index) => (
                  <li key={index}>
                    <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        id={`checkbox-item-${index}`}
                        type="checkbox"
                        value={name}
                        checked={filterNames.includes(name)}
                        onChange={() => handleFilterChange(name)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <label
                        htmlFor={`checkbox-item-${index}`}
                        className="w-full ms-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300"
                      >
                        {name}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={downloadReport}
          className="flex bg-blue-400 text-sm hover:bg-blue-600 text-white font-medium  px-5 py-2.5 rounded-lg focus:outline-none focus:shadow-outline"
          type="button"
        >
          <svg
            width="22"
            height="22"
            fill="#ffffff"
            className="mr-2"
            viewBox="0 0 36 36"
            version="1.1"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            stroke-width="0.9"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <title>install-line</title>{" "}
              <path
                class="clr-i-outline clr-i-outline-path-1"
                d="M30.92,8H26.55a1,1,0,0,0,0,2H31V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V10A2,2,0,0,0,30.92,8Z"
              ></path>
              <path
                class="clr-i-outline clr-i-outline-path-2"
                d="M10.3,18.87l7,6.89a1,1,0,0,0,1.4,0l7-6.89a1,1,0,0,0-1.4-1.43L19,22.65V4a1,1,0,0,0-2,0V22.65l-5.3-5.21a1,1,0,0,0-1.4,1.43Z"
              ></path>{" "}
              <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>{" "}
            </g>
          </svg>
          Download Report
        </button>
      </div>

      {filteredData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="border border-gray-300">
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Employee Name
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Allowance Type
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Month
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Date Of Which Allowance is claimed
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Amount as per policy
                </th>
                <th scope="col" className="px-6 py-3 border border-gray-300">
                  Project Code
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-100"
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 border border-gray-300 dark:border-gray-600"
                    >
                      {cell}
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
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
              <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Payroll;
