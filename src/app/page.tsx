"use client";

import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

// TVL(Total Value Locked) used for protcal
interface TVLData {
  protocol: string;
  tvl: number;
}

interface VolumeData {
  chain: string;
  volume: number;
}

interface MetricsData {
  id: number;
  timestamp: string;
  protocol: string;
  chain: string;
  total_value_locked_usd: number;
  daily_volume_usd: number;
  active_users: number;
  token: string;
}

interface DashboardData {
  metrics: MetricsData[];
  tvlByProtocol: TVLData[];
  volumeByChain: VolumeData[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("charts");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Data</CardTitle>
            <CardDescription>
              Unable to load dashboard data. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // calculate total TVL and volume
  const totalTVL = data.tvlByProtocol.reduce((acc, curr) => acc + curr.tvl, 0);
  const totalVolume = data.volumeByChain.reduce(
    (acc, curr) => acc + curr.volume,
    0,
  );
  const totalUsers = data.metrics.reduce(
    (acc, curr) => acc + curr.active_users,
    0,
  );

  // sort data by TVL and volume for better visualization
  const sortedTVLData = [...data.tvlByProtocol].sort((a, b) => b.tvl - a.tvl);
  const sortedVolumeData = [...data.volumeByChain].sort(
    (a, b) => b.volume - a.volume,
  );

  // colors and formatting
  const tvlChartData = {
    labels: sortedTVLData.map((d) => d.protocol),
    datasets: [
      {
        label: "Total Value Locked (USD)",
        data: sortedTVLData.map((d) => d.tvl),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // Blue
          "rgba(99, 102, 241, 0.7)", // Indigo
          "rgba(139, 92, 246, 0.7)", // Purple
          "rgba(236, 72, 153, 0.7)", // Pink
          "rgba(239, 68, 68, 0.7)", // Red
          "rgba(245, 158, 11, 0.7)", // Amber
          "rgba(16, 185, 129, 0.7)", // Emerald
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const volumeChartData = {
    labels: sortedVolumeData.map((d) => d.chain),
    datasets: [
      {
        label: "Volume by Chain (USD)",
        data: sortedVolumeData.map((d) => d.volume),
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)", // Emerald
          "rgba(245, 158, 11, 0.7)", // Amber
          "rgba(239, 68, 68, 0.7)", // Red
          "rgba(236, 72, 153, 0.7)", // Pink
          "rgba(139, 92, 246, 0.7)", // Purple
          "rgba(99, 102, 241, 0.7)", // Indigo
          "rgba(59, 130, 246, 0.7)", // Blue
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  // extract timestamp data for trend analysis
  const timestampMap = new Map();

  // group data by timestamp to get values per day
  data.metrics.forEach((d) => {
    const date = new Date(d.timestamp);
    const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;

    if (!timestampMap.has(dateKey)) {
      timestampMap.set(dateKey, { volume: 0, count: 0 });
    }

    const entry = timestampMap.get(dateKey);
    entry.volume += d.daily_volume_usd;
    entry.count += 1;
  });

  // sort by timestamps
  const sortedTimestamps = Array.from(timestampMap.keys()).sort((a, b) => {
    const [aMonth, aDay] = a.split("/").map(Number);
    const [bMonth, bDay] = b.split("/").map(Number);

    if (aMonth !== bMonth) return aMonth - bMonth;
    return aDay - bDay;
  });

  const timeSeriesData = {
    labels: sortedTimestamps,
    datasets: [
      {
        label: "Daily Volume Trend",
        data: sortedTimestamps.map((date) => timestampMap.get(date).volume),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            DeFi Protocol Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time analytics for decentralized finance protocols
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Value Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">
                  {formatNumber(totalTVL)}
                </p>
                <span className="ml-2 text-xs flex items-center text-green-600">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  4.3%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">
                  {formatNumber(totalVolume)}
                </p>
                <span className="ml-2 text-xs flex items-center text-red-600">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  2.1%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">
                  {totalUsers.toLocaleString()}
                </p>
                <span className="ml-2 text-xs flex items-center text-green-600">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  7.8%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* tabs TODO: should add to components/ui */}
        <div className="flex justify-center sm:justify-start overflow-x-auto mb-6">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1">
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "charts" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setActiveTab("charts")}
            >
              Charts
            </button>
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "trends" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setActiveTab("trends")}
            >
              Trends
            </button>
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "data" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setActiveTab("data")}
            >
              Raw Data
            </button>
          </div>
        </div>

        <div className="w-full">
          {activeTab === "charts" && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>TVL by Protocol</CardTitle>
                    <CardDescription>
                      Distribution of Total Value Locked across protocols
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full chart-container">
                      <Bar
                        data={tvlChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  return `${context.label}: ${formatNumber(context.raw as number)}`;
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return formatNumber(value as number);
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Volume by Chain</CardTitle>
                    <CardDescription>
                      Trading volume distribution across different blockchains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full chart-container">
                      <Doughnut
                        data={volumeChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = formatNumber(
                                    context.raw as number,
                                  );
                                  const percentage = (
                                    ((context.raw as number) / totalVolume) *
                                    100
                                  ).toFixed(1);
                                  return `${label}: ${value} (${percentage}%)`;
                                },
                              },
                            },
                          },
                          cutout: "60%",
                          radius: "90%",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Volume Trends</CardTitle>
                  <CardDescription>
                    Daily trading volume trends across all protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full chart-container">
                    <Line
                      data={timeSeriesData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `Volume: ${formatNumber(context.raw as number)}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value) {
                                return formatNumber(value as number);
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "data" && (
            <div className="w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Raw Protocol Data</CardTitle>
                  <CardDescription>
                    Raw data table with all protocol metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed md:table-auto border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Protocol
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Chain
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TVL
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Users
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Token
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.metrics.slice(0, 10).map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]">
                              {item.protocol}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">
                              {item.chain}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(item.total_value_locked_usd)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(item.daily_volume_usd)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.active_users.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-[100px]">
                              {item.token}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
