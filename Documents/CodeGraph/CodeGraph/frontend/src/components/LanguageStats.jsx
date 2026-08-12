import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { memo } from 'react';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Displays language statistics as a pie chart
 */
const LanguageStats = memo(function LanguageStats({ languageStats }) {
  if (!languageStats || Object.keys(languageStats).length === 0) {
    return (
      <div className="glass-card language-stats">
        <h3>Language Statistics</h3>
        <p>No language data available</p>
      </div>
    );
  }

  // Prepare data for chart
  const labels = Object.keys(languageStats);
  const data = Object.values(languageStats);

  // Generate colors for the chart
  const backgroundColor = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#22d3ee', // Cyan
    '#34d399', // Emerald
    '#fbbf24', // Amber
    '#fb7185', // Rose
    '#ef4444', // Red
    '#10b981', // Green
    '#06b6d4'  // Sky
  ].slice(0, labels.length);

  return (
    <div className="glass-card language-stats">
      <h3>Language Statistics</h3>
      <div className="language-chart-container">
        <Pie
          data={{
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColor,
              borderWidth: 0
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                    return `${label}: ${percentage} (${value.toLocaleString()} bytes)`;
                  }
                }
              }
            }
          }}
        />
      </div>
      <div className="language-details">
        {labels.map((lang, index) => (
          <div key={lang} className="language-item">
            <div className="language-info">
              <div className="language-color"
                   style={{ backgroundColor: backgroundColor[index] }}></div>
              <span className="language-name">{lang}</span>
            </div>
            <div className="language-value">
              {(data[index] / 1024).toFixed(1)} KB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}