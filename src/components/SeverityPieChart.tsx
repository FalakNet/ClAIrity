import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';

// Register the required chart components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SeverityPieChartProps {
  severityData: {
    severity: string;
    count: number;
  }[];
}

const SeverityPieChart: React.FC<SeverityPieChartProps> = ({ severityData }) => {
  // Colors for each severity level
  const backgroundColors = [
    '#a6d76e', // Severity 1 - Green
    '#D3CE6F', // Severity 2 - Yellow-Green
    '#ffc46f', // Severity 3 - Yellow
    '#E98D65', // Severity 4 - Orange
    '#d2565b', // Severity 5 - Red
  ];

  // Prepare data for the chart
  const chartData = {
    labels: ['Level 1 (Mild)', 'Level 2', 'Level 3', 'Level 4', 'Level 5 (Severe)'],
    datasets: [
      {
        data: Array(5).fill(0), // Initialize with zeros, will be filled below
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color),
        borderWidth: 1,
      },
    ],
  };

  // Fill the data array based on the provided severity data
  severityData.forEach(item => {
    const severityLevel = parseInt(item.severity, 10);
    if (severityLevel >= 1 && severityLevel <= 5) {
      chartData.datasets[0].data[severityLevel - 1] = item.count;
    }
  });

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Montserrat',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((Number(value) / Number(total)) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="severity-pie-chart">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default SeverityPieChart;
