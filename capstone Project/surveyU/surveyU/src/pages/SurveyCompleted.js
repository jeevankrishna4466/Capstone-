// src/SurveyCompleted.js
import React from 'react';
import { Typography, Box, Button, Container } from '@mui/material';

function SurveyCompleted() {
  return (
    <Container maxWidth="sm">
      <Box sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Your survey responses have been successfully submitted.
        </Typography>
        <Button variant="contained" color="primary" href="/" sx={{ mt: 3 }}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
}

export default SurveyCompleted;
