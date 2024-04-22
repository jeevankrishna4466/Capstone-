// src/components/Header.js
import React from 'react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">App Usage Survey</Typography>
        
      </Toolbar>
    </AppBar>
  );
}

export default Header;
