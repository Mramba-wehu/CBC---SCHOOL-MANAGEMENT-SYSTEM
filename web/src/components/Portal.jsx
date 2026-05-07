import React from 'react';
import { useAuth } from '../context/AuthContext';
import ParentPortal from '../pages/ParentPortal';
import ProgressPortal from '../pages/ProgressPortal';

const Portal = () => {
  const { user } = useAuth();

  if (user?.role === 'PARENT') {
    return <ParentPortal />;
  }

  return <ProgressPortal />;
};

export default Portal;
