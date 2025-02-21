// frontend/src/components/Reports/ReportList.js
/*import React, { useEffect, useState } from 'react';
import reportService from '../../services/reportService';

const ReportList = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await reportService.getReports();
      setReports(data);
    };
    fetchReports();
  }, []);

  return (
    <div>
      <h1>Report List</h1>
      <ul>
        {reports.map(report => (
          <li key={report.id}>{report.type}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;
*/