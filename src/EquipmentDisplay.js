import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Autocomplete } from '@mui/material';
import emailjs from 'emailjs-com';
import { useDebounce } from 'use-debounce'; 
import { OutagesContext } from './OutagesContext';
import './EquipmentDisplay.css';

const EquipmentDisplay = () => {
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 500);
  const outages = useContext(OutagesContext);
  const rowRefs = useRef({});

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

  useEffect(() => {
    if (debouncedInputValue) {
      const filtered = equipments.filter(equipment =>
        equipment.station.toLowerCase().includes(debouncedInputValue.toLowerCase())
      );

      if (filtered.length > 0 && rowRefs.current[filtered[0].equipmentNo]) {
        rowRefs.current[filtered[0].equipmentNo].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [debouncedInputValue, equipments]);

  const filteredEquipments = equipments.filter(equipment =>
    equipment.station.toLowerCase().includes(debouncedInputValue.toLowerCase())
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

  const sendEmail = () => {
    const currentOutageEquipmentNumbers = outages.map(outage => outage.equipmentNo.toLowerCase());
    const isExisting = selectedEquipments.some(equipment => currentOutageEquipmentNumbers.includes(equipment.equipmentNo.toLowerCase()));

    if (isExisting) {
        alert('One or more selected equipment numbers already exist in current outages.');
        return;
    }

    const emailHtmlContent = selectedEquipments.map(equipment => `
      <p>Station: ${equipment.station}<br>
      Train No: ${equipment.trainNo}<br>
      Equipment No: ${equipment.equipmentNo}<br>
      Equipment Type: ${equipment.equipmentType}<br>
      Serving: ${equipment.serving}<br>
      ADA: ${equipment.ADA}<br>
      Status: ${equipment.status}<br>
      Description: ${equipment.description}<br>
      Bus Connections: ${equipment.busConnections}<br>
      Alternative Route: ${equipment.alternativeRoute}<br></p>
    `).join('');

    const emailParams = {
        from_name: 'Current Outages Reporting System',
        to_name: 'Urmil Trivedi',
        message: emailHtmlContent,
        to_email: 'utrivedi330@gmail.com',
    };

    emailjs.send('service_vh5t3nv', 'template_vpr39id', emailParams)
      .then((result) => {
          console.log('Email successfully sent!', result.text);
          alert('Email successfully sent!');
      }, (error) => {
          console.log('Failed to send the email:', error.text);
          alert('Failed to send the email, please try again later.');
      });
  };

  return (
    <div>
      <Button variant="contained" onClick={sendEmail} disabled={selectedEquipments.length === 0}>Send Email</Button>
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
                    <TableCell padding="checkbox"></TableCell>
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
                const isEquipmentOutage = isOutage(equipment.equipmentNo);
                return (
                    <TableRow
                      key={index}
                      ref={(el) => (rowRefs.current[equipment.equipmentNo] = el)}
                      selected={isSelected(equipment)}
                    >
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isSelected(equipment)}
                                onChange={(event) => handleSelect(event, equipment)}
                                disabled={isEquipmentOutage} // Disable checkbox if there's an outage
                            />
                        </TableCell>
                        <TableCell>{equipment.station}</TableCell>
                        <TableCell>{equipment.trainNo}</TableCell>
                        <TableCell>
                            {equipment.equipmentNo}
                            {isEquipmentOutage && <span className="outage-alert">Already existing outage</span>}
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
