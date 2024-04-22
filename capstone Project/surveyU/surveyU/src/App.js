import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { orange } from '@mui/material/colors';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Survey from './pages/Survey';
import Results from './pages/Results';
import Register from './pages/Register';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SurveyCompleted from './pages/SurveyCompleted';


const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.status.danger,
  '&.Mui-checked': {
    color: theme.status.danger,
  },
}));

const theme = createTheme({
  status: {
    danger: orange[500],
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
      <Header />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/survey" element={<Survey/>} />
          <Route path="/results" element={<Results/>} />
          <Route path="/completed" element={<SurveyCompleted/>} />
        </Routes>

        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;