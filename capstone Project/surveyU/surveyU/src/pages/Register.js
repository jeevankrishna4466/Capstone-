import React, { useState } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://surveyuvicorn-main-app-host-0-0-0-0-port.onrender.com/api/register', { email });
      // Show success message or redirect to a confirmation page
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Register for Survey</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Register
        </Button>
      </form>
    </div>
  );
}

export default Register;