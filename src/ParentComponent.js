import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Autocomplete } from '@mui/material';
import emailjs from 'emailjs-com';
import { useDebounce } from 'use-debounce'; 

const EquipmentDisplay = ({ outages }) => {
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  useEffect(() => {
    emailjs.init("I2kW2WarpXUWb-bi1");

    const equipmentsEndpoint = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene_equipments.xml';
    fetch(equipmentsEndpoint)
     .then(response => response.text())
      .then(str => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(str, "application/xml");
        const equipmentelements = xml.getElementsByTagName('equipment');
        const parsedequipments = Array.from(equipmentelements).map(equipment => ({
          station: equipment.getElementsByTagName('station')[0]?.textContent || 'N/A',
          trainNo: equipment.getElementsByTagName('trainno')[0]?.textContent || 'N/A',
          equipmentNo: equipment.getElementsByTagName('equipmentno')[0]?.textContent || 'N/A',
          equipmentType: equipment.getElementsByTagName('equipmenttype')[0]?.textContent || 'N/A',
          serving: equipment.getElementsByTagName('serving')[0]?.textContent || 'N/A',
          ADA: equipment.getElementsByTagName('ada')[0]?.textContent || 'N/A',
          status: equipment.getElementsByTagName('isactive')[0]?.textContent || 'N/A',
          description: equipment.getElementsByTagName('shortdescription')[0]?.textContent || 'N/A',
          busConnections: equipment.getElementsByTagName('busconnections')[0]?.textContent || 'N/A',
          alternativeRoute: equipment.getElementsByTagName('alternativeroute')[0]?.textContent || 'N/A',
        }));
        
        setEquipments(parsedequipments);
      })
      .catch(error => {
        console.error('Error fetching or parsing data:', error);
      });
  }, []);

  const filteredEquipments = equipments.filter(equipment =>
    equipment.equipmentNo.toLowerCase().includes(debouncedInputValue.toLowerCase())
  );

  const handleSelect = (event, equipment) => {
    const selectedIndex = selectedEquipments.findIndex(selected => selected === equipment);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedEquipments, equipment];
    } else {
      newSelected = selectedEquipments.filter(selected => selected !== equipment);
    }
    setSelectedEquipments(newSelected);
  };

  const isSelected = (equipment) => selectedEquipments.includes(equipment);

  const isOutage = (equipmentNo) => {
    return outages.some(outage => outage.equipmentNo === equipmentNo);
  };

  return (
    <div>
      <Button variant="contained">Send Email</Button> {/* Modified for simplicity */}
      <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={filteredEquipments}
          getOptionLabel={(option) => option.station}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
          }}
          renderInput={(params) => <TextField {...params} label="Filter by Station" variant="outlined" />}
          sx={{ width: 300, marginBottom: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Station</TableCell>
                    <TableCell>Train No</TableCell>
                    <TableCell>Equipment No</TableCell>
                    <TableCell>Equipment Type</TableCell>
                    <TableCell>Serving</TableCell>
                    <TableCell>ADA</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Bus Connections</TableCell>
                    <TableCell>Alternative Route</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {filteredEquipments.map((equipment, index) => {
                return (
                    <TableRow key={index}>
                        <TableCell>{equipment.station}</TableCell>
                        <TableCell>{equipment.trainNo}</TableCell>
                        <TableCell>
                            {equipment.equipmentNo}
                            {isOutage(equipment.equipmentNo) && <span style={{ marginLeft: '10px', color: 'red' }}>This exists in outage</span>}
                        </TableCell>
                        <TableCell>{equipment.equipmentType}</TableCell>
                        <TableCell>{equipment.serving}</TableCell>
                        <TableCell>{equipment.ADA}</TableCell>
                        <TableCell>{equipment.status}</TableCell>
                        <TableCell>{equipment.description}</TableCell>
                        <TableCell>{equipment.busConnections}</TableCell>
                        <TableCell>{equipment.alternativeRoute}</TableCell>
                    </TableRow>
                );
            })}
            </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default EquipmentDisplay;
