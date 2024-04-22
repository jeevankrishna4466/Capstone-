import React, { useState } from 'react';
import { Typography, FormControl, RadioGroup, FormControlLabel, Radio, TextField, Button, Checkbox, FormGroup } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Survey() {
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('');
  const [apps, setApps] = useState([]);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  let navigate = useNavigate();
  const handleAppChange = (app) => {
    const updatedApps = apps.includes(app)
      ? apps.filter(selectedApp => selectedApp !== app)
      : [...apps, app];
    setApps(updatedApps);
  };

  const handleRatingChange = (app, rating) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [app]: rating,
    }));
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }
    if (apps.length === 0 || Object.keys(ratings).some(key => ratings[key] === '')) {
      setError('Please rate at least one app');
      return;
    }
    setError('');
    try {
      const response = await axios.post('https://surveyuvicorn-main-app-host-0-0-0-0-port.onrender.com/api/survey', { email, platform, apps, ratings, feedback });
      // Handle success
      
      if(response.data.success)
      {
        setSuccessMessage(response.data.message);
        setError('');
        navigate('/completed');
      }
      else{
        setSuccessMessage();
        setError(response.data.message);
      }
        
      // Optionally, clear form or redirect
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from the server, please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error submitting survey: ' + error.message);
      }
    }
  };

  return (
    <div>
      <Typography variant="h4">App Usage Survey</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Select your preferred app platform:</Typography>
          <RadioGroup value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <FormControlLabel value="ios" control={<Radio />} label="iOS" />
            <FormControlLabel value="android" control={<Radio />} label="Android" />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Select the apps you commonly use:</Typography>
          <FormGroup>
            {['WhatsApp', 'Instagram', 'LinkedIn', 'Facebook', 'Twitter'].map(app => (
              <FormControlLabel
                key={app}
                control={<Checkbox checked={apps.includes(app)} onChange={() => handleAppChange(app)} />}
                label={app}
              />
            ))}
          </FormGroup>
        </FormControl>
        {apps.map(app => (
          <FormControl key={app} component="fieldset">
            <Typography variant="subtitle1">Rate the usability of {app} (1-5):</Typography>
            <RadioGroup value={ratings[app] || ''} onChange={(e) => handleRatingChange(app, e.target.value)}>
              {[1, 2, 3, 4, 5].map(value => (
                <FormControlLabel key={value} value={value.toString()} control={<Radio />} label={value.toString()} />
              ))}
            </RadioGroup>
          </FormControl>
        ))}
        <TextField
          label="Additional Feedback"
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        {error && <Typography color="error" style={{ marginTop: 20 }}>{error}</Typography>}
        {successMessage && <Typography color="primary" style={{ marginTop: 20 }}>{successMessage}</Typography>}
      </form>
    </div>
  );
}

export default Survey;
