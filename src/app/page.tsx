'use client';

import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  const tvlChartData = {
    labels: data.tvlByProtocol.map((d: any) => d.protocol),
    datasets: [
      {
        label: 'Total Value Locked (USD)',
        data: data.tvlByProtocol.map((d: any) => d.tvl),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  const volumeChartData = {
    labels: data.volumeByChain.map((d: any) => d.chain),
    datasets: [
      {
        data: data.volumeByChain.map((d: any) => d.volume),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-4xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold mb-8">DeFi Protocol Metrics</h1>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">TVL by Protocol</h2>
                  <div className="h-64">
                    <Bar data={tvlChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Volume by Chain</h2>
                  <div className="h-64">
                    <Doughnut data={volumeChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
