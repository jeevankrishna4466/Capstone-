import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SurveyResults() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://surveyuvicorn-main-app-host-0-0-0-0-port.onrender.com/api/results');
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching survey results:', error);
      }
    };

    fetchData();
  }, []);
  const handleDownload = () => {
    // This will open the file download endpoint in a new window/tab.
    // The browser will handle the content disposition and download the file as specified by the backend.
    window.open('https://surveyuvicorn-main-app-host-0-0-0-0-port.onrender.com/download-csv', '_blank');
};

  if (!chartData) {
    return <Typography>Loading...</Typography>;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', my: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>Survey Results Insights</Typography>
      <Button variant="contained" color="primary" onClick={handleDownload} sx={{ mb: 4 }}>
        Download Survey Data
      </Button>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Average Ratings by Platform</Typography>
          <Bar data={chartData.average_ratings_data} options={{ ...options, title: { ...options.title, text: 'Average Ratings by Platform' } }} />
        </CardContent>
      </Card>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Response Counts per Platform</Typography>
          <Bar data={chartData.response_counts_data} options={{ ...options, title: { ...options.title, text: 'Response Counts per Platform' } }} />
        </CardContent>
      </Card>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Overall Average Ratings</Typography>
          <Bar data={chartData.overall_avg_ratings} options={{ ...options, title: { ...options.title, text: 'Overall Average Ratings' } }} />
        </CardContent>
      </Card>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Review Frequency per App</Typography>
          <Bar data={chartData.app_review_frequency} options={{ ...options, title: { ...options.title, text: 'Review Frequency per App' } }} />
        </CardContent>
      </Card>
    </Box>
  );
}

export default SurveyResults;
