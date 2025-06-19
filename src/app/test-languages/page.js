'use client';

import React, { useState, useEffect } from 'react';

function SimpleLanguageTest() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/forum/data?limit=5');
        
        if (response.ok) {
          const data = await response.json();
          setLanguages(data.languages || []);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Simple de Idiomas</h1>
      
      <div className="mb-4">
        <p><strong>Estado:</strong> {loading ? 'Cargando...' : 'Cargado'}</p>
        <p><strong>Cantidad de idiomas:</strong> {languages.length}</p>
      </div>

      <div className="mb-4">
        <label className="block font-bold mb-2">Select de Idiomas:</label>
        <select className="border border-theme-border p-2 w-64 bg-theme-card text-theme-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent">
          <option value="">Todos los idiomas</option>
          {languages.map((lang, index) => (
            <option key={`lang-${lang.code}-${index}`} value={lang.code}>
              {lang.name} ({lang.thread_count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold mb-2">Debug - Lista de Idiomas:</h3>
        <pre className="bg-gray-100 p-2 text-sm">
          {JSON.stringify(languages, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default SimpleLanguageTest;
