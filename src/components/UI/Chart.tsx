import React, { useEffect, useRef, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartData,
  BarController,
  LineController
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: ChartData<'bar' | 'line', number[], string>;
  type: 'bar' | 'line';
}

const Chart: React.FC<ChartProps> = ({ data, type }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS<'bar' | 'line', number[], string> | null>(null);
  const [visibleDatasets, setVisibleDatasets] = useState(() => {
    const saved = localStorage.getItem('chartVisibleDatasets');
    return saved ? JSON.parse(saved) : data.datasets.map(() => true);
  });

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new ChartJS(ctx, {
        type,
        data: {
          ...data,
          datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            hidden: !visibleDatasets[index]
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }
          },
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                color: 'white',
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              },
              onClick: (evt, legendItem) => {
                const index = legendItem.datasetIndex;
                if (index !== undefined) {
                  const newVisibleDatasets = [...visibleDatasets];
                  newVisibleDatasets[index] = !newVisibleDatasets[index];
                  setVisibleDatasets(newVisibleDatasets);
                  localStorage.setItem('chartVisibleDatasets', JSON.stringify(newVisibleDatasets));
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              cornerRadius: 4,
              boxPadding: 3
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, visibleDatasets]);

  return <canvas ref={chartRef} />;
};

export default Chart;