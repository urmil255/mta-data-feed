import React, { createContext, useState, useEffect } from 'react';

export const OutagesContext = createContext(null);

export const OutagesProvider = ({ children }) => {
  const [outages, setOutages] = useState([]);

  useEffect(() => {
    const fetchOutages = () => {
      fetch('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene.xml')
        .then(response => response.text())
        .then(str => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const outageElements = xml.getElementsByTagName('outage');
          const parsedOutages = Array.from(outageElements).map(outage => ({
            equipmentNo: outage.getElementsByTagName('equipment')[0]?.textContent,
          }));
          setOutages(parsedOutages);
        })
        .catch(error => console.error('Error fetching data:', error));
    };

    fetchOutages();
  }, []);

  return (
    <OutagesContext.Provider value={outages}>
      {children}
    </OutagesContext.Provider>
  );
};
