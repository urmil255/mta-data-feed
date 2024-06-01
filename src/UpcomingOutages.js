import React, { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import emailjs from 'emailjs-com';
import { Autocomplete, TextField } from '@mui/material';
import { useDebounce } from 'use-debounce';

const UpcomingOutages = () => {
  const [upcomingOutages, setUpcomingOutages] = useState([]);
  const [selectedOutages, setSelectedOutages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 500);
  const rowRefs = useRef({});

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init("I2kW2WarpXUWb-bi1");
    const apiEndpoint = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene_upcoming.xml';

    fetch(apiEndpoint)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(str => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(str, "application/xml");
        const outageElements = xml.getElementsByTagName('outage');
        const parsedOutages = Array.from(outageElements).map(outage => ({
          station: outage.getElementsByTagName('station')[0]?.textContent,
          trainno: outage.getElementsByTagName('trainno')[0]?.textContent,
          equipment: outage.getElementsByTagName('equipment')[0]?.textContent,
          equipmenttype: outage.getElementsByTagName('equipmenttype')[0]?.textContent,
          serving: outage.getElementsByTagName('serving')[0]?.textContent,
          ada: outage.getElementsByTagName('ada')[0]?.textContent,
          outagedate: outage.getElementsByTagName('outagedate')[0]?.textContent,
          estimatedreturntoservice: outage.getElementsByTagName('estimatedreturntoservice')[0]?.textContent,
          reason: outage.getElementsByTagName('reason')[0]?.textContent,
        }));
        setUpcomingOutages(parsedOutages);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (debouncedInputValue) {
      const filtered = upcomingOutages.filter(outage =>
        outage.station.toLowerCase().includes(debouncedInputValue.toLowerCase())
      );

      if (filtered.length > 0 && rowRefs.current[filtered[0].station]) {
        rowRefs.current[filtered[0].station].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [debouncedInputValue, upcomingOutages]);

  const filteredOutages = upcomingOutages.filter(outage =>
    outage.station.toLowerCase().includes(debouncedInputValue.toLowerCase())
  );

  const handleSelect = (event, outage) => {
    const selectedIndex = selectedOutages.findIndex(selected => selected === outage);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedOutages, outage];
    } else {
      newSelected = selectedOutages.filter(selected => selected !== outage);
    }
    setSelectedOutages(newSelected);
  };

  const isSelected = (outage) => selectedOutages.includes(outage);

  const sendEmail = () => {
    const emailHtmlContent = `
      <table style="width:100%; border-collapse: collapse;" border="1">
        <tr>
          <th style="padding: 8px; text-align: left;">Station</th>
          <th style="padding: 8px; text-align: left;">Train No</th>
          <th style="padding: 8px; text-align: left;">Equipment</th>
          <th style="padding: 8px; text-align: left;">EquipmentType</th>
          <th style="padding: 8px; text-align: left;">Serving</th>
          <th style="padding: 8px; text-align: left;">OutageDate</th>
          <th style="padding: 8px; text-align: left;">Estimated Return</th>
          <th style="padding: 8px; text-align: left;">Reason</th>
        </tr>
        ${selectedOutages.map(outage => `
        <tr>
          <td style="padding: 8px;">${outage.station}</td>
          <td style="padding: 8px;">${outage.trainno}</td>
          <td style="padding: 8px;">${outage.equipment}</td>
          <td style="padding: 8px;">${outage.equipmenttype}</td>
          <td style="padding: 8px;">${outage.serving}</td>
          <td style="padding: 8px;">${outage.outagedate}</td>
          <td style="padding: 8px;">${outage.estimatedreturntoservice}</td>
          <td style="padding: 8px;">${outage.reason}</td>
        </tr>
        `).join('')}
      </table>
    `;
    const emailParams = {
      from_name: 'Upcoming Outages Reporting System',
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
      <Button variant="contained" onClick={sendEmail} disabled={selectedOutages.length === 0}>Send Email</Button>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={filteredOutages}
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
              <TableCell>Equipment</TableCell>
              <TableCell>Equipment Type</TableCell>
              <TableCell>Serving</TableCell>
              <TableCell>Outage Date</TableCell>
              <TableCell>Estimated Return Service</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingOutages.map((outage, index) => {
              const isItemSelected = isSelected(outage);
              return (
                <TableRow
                  key={index}
                  ref={(el) => (rowRefs.current[outage.station] = el)}
                  role="checkbox"
                  selected={isItemSelected}
                  onClick={(event) => handleSelect(event, outage)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                  </TableCell>
                  <TableCell>{outage.station}</TableCell>
                  <TableCell>{outage.trainno}</TableCell>
                  <TableCell>{outage.equipment}</TableCell>
                  <TableCell>{outage.equipmenttype}</TableCell>
                  <TableCell>{outage.serving}</TableCell>
                  <TableCell>{outage.outagedate}</TableCell>
                  <TableCell>{outage.estimatedreturntoservice}</TableCell>
                  <TableCell>{outage.reason}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UpcomingOutages;
