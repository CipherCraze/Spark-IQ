import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Line Chart Data
const lineChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Assignments Completed',
      data: [3, 5, 7, 10],
      borderColor: 'rgba(99, 102, 241, 1)',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.4,
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Assignment Progress Over Time',
    },
  },
};

// Pie Chart Data
const pieChartData = {
  labels: ['A+', 'A', 'B', 'C'],
  datasets: [
    {
      label: 'Grades',
      data: [12, 19, 3, 5],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(79, 70, 229, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Grade Distribution',
    },
  },
};

// Bar Chart Data
const barChartData = {
  labels: ['Math', 'Science', 'History', 'English'],
  datasets: [
    {
      label: 'Average Scores',
      data: [85, 78, 92, 88],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
    },
  ],
};

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Subject-wise Performance',
    },
  },
};

// Line Chart Component
export const LineChart = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <Line data={lineChartData} options={lineChartOptions} />
  </div>
);

// Pie Chart Component
export const PieChart = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <Pie data={pieChartData} options={pieChartOptions} />
  </div>
);

// Bar Chart Component
export const BarChart = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <Bar data={barChartData} options={barChartOptions} />
  </div>
);