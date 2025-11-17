
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 p-4 shadow-md text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-teal-400">Panel de Capacidad de Producción - CNP Network</h1>
      <p className="text-gray-400 mt-1">Analiza tu producción, identifica cuellos de botella y maximiza tu rentabilidad.</p>
    </header>
  );
};

export default Header;
