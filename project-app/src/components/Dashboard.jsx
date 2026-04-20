import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";

import DashboardCard from "./dashboardcard.js";
import { API_ENDPOINT } from "../util.js";
import { useNavigate } from "react-router-dom";

const 
Ind = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const [user, setUser] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        setUser(user);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token not found in localStorage");
        }
        const user = localStorage.getItem("user");
        let url = "";
        if (user === "admin") {
          url = `${API_ENDPOINT}/api/v1/orders/dashboard`;
        } else {
          const clientId = localStorage.getItem("clientId");
          url = `${API_ENDPOINT}/api/v1/orders/client-dashboard/${clientId}`;
        }

        const response = await fetch(url, {
          headers: {
            "x-access-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setDashboardData(data.data); // Assuming the data structure matches the expected format
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const downloadProductFile = async () => {
    try {
      console.log("downloading product file");
      const downloadUrl = `${API_ENDPOINT}/${dashboardData.productFile.filePath}`;

      // Fetch the file using the URL
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", dashboardData.productFile.fileName); // Set the filename here
      document.body.appendChild(link);

      // Trigger a click event on the link
      link.click();

      // Clean up: remove the temporary link and revoke the temporary URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading product file:", error);
    }
  };

  const openNewPage = () => {
    window.open(`${dashboardData.productFile.googleDriveURL}`, "_blank");
  };

  return (
    <div>
      {dashboardData && (
        <div id="main-content">
          <div className="container-fluid">
            {user && user === "admin" ? (
              <div className="row clearfix row-deck mt-5">
                <DashboardCard
                  title="Today Orders"
                  value={dashboardData.todayOrders}
                  lineColor="#39afa6"
                  fillColor="#73cec7"
                  data={[4, 1, 5, 2, 7, 3, 4]}
                />
                <DashboardCard
                  title="Yesterday Cancelled"
                  value={dashboardData.yesterdayCounts["Cancelled"]}
                  lineColor="#ffa901"
                  fillColor="#efc26b"
                  data={[1, 4, 2, 3, 6, 2]}
                />

                <DashboardCard
                  title="Yesterday Correct RTO"
                  value={dashboardData.yesterdayCounts["Right RTO Return"]}
                  lineColor="#38c172"
                  fillColor="#84d4a6"
                  data={[1, 4, 2, 3, 1, 5]}
                />
                <DashboardCard
                  title="Yesterday Wrong RTO"
                  value={dashboardData.yesterdayCounts["Wrong RTO Return"]}
                  lineColor="#ed4e42"
                  fillColor="#db2f23"
                  data={[1, 3, 5, 1, 4, 2]}
                />
                <DashboardCard
                  title="Yesterday Right Customer Return"
                  value={dashboardData.yesterdayCounts["Right Customer Return"]}
                  lineColor="#226fd8"
                  fillColor="#7ea7de"
                  data={[1, 3, 5, 1, 4, 2]}
                />
                <DashboardCard
                  title="Yesterday Wrong Customer Return"
                  value={dashboardData.yesterdayCounts["Wrong Customer Return"]}
                  lineColor="#eaed40"
                  fillColor="#dbde1f"
                  data={[1, 3, 5, 1, 4, 2]}
                />
              </div>
            ) : (
              <div className="row clearfix row-deck mt-5">
                <DashboardCard
                  title="WALLET BALANCE"
                  value={`₹` + dashboardData.walletBalance}
                  lineColor="#39afa6"
                  fillColor="#73cec7"
                  data={[4, 1, 5, 2, 7, 3, 4]}
                  onClick={() => {
                    history("/WalletHistory");
                  }}
                />
                <DashboardCard
                  title={ dashboardData?.productFile?.fileName}
                  value="Download"
                  lineColor="#ffa901"
                  fillColor="#efc26b"
                  data={[1, 4, 2, 3, 6, 2]}
                  valueColor="#007bff"
                  onClick={downloadProductFile}
                />

                <DashboardCard
                  title="ALL PRODUCTS URL"
                  value="Click Here"
                  lineColor="#38c172"
                  fillColor="#84d4a6"
                  data={[1, 4, 2, 3, 1, 5]}
                  valueColor="#007bff"
                  onClick={openNewPage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ind;
