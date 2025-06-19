
import React from 'react';
import Navigation from '../components/Navigation';
import TCFDAdminPanel from '../components/tcfd/admin/TCFDAdminPanel';

const TCFDAdmin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <TCFDAdminPanel />
      </div>
    </div>
  );
};

export default TCFDAdmin;
