import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <Typography variant="h4">Welcome to App Usage Survey</Typography>
      <Typography variant="body1">
        Participate in our survey to help us understand user behavior and preferences for popular apps across different platforms.
      </Typography>
      <Button component={Link} to="/survey" variant="contained" color="primary">
        Take Survey
      </Button>
      &nbsp;
      <Button component={Link} to="/results" variant="contained" color="primary">
        Results
      </Button>
    </div>
  );
}

export default Home;