import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  CheckCircle2,
  Filter,
  Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const AdminReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (start = startDate, end = endDate) => {
    try {
      setLoading(true);
      let url = `${API_BASE}/reports/productivity`;
      const params = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await axios.get(url, authHeaders);
      setReport(res.data.data || {});
    } catch (err) {
      console.error('Error fetching productivity report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchReport('', '');
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      let url = `${API_BASE}/reports/timesheets/export`;
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url, {
        ...authHeaders,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'taskflow_timesheets.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting timesheets CSV:', err);
      alert('Failed to download CSV export');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto', color: '#2b2b2b' }}>
      {/* Top Header & Export Action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Company Productivity & Timesheet Reports
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Executive analytics on employee worklogs, billable hours by department, and exportable timesheets.
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleDownloadCsv}
          disabled={downloading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: downloading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <Download size={16} />
          {downloading ? 'Generating CSV...' : 'Export Timesheets CSV'}
        </button>
      </div>

      {/* Date Range Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4d4d4',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <form onSubmit={handleApplyFilter} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Calendar size={15} color="#888" />
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Apply Filter
          </button>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilter}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: '#ffffff',
                color: '#666',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </form>

        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          Showing records {startDate ? `from ${startDate}` : 'all time'} {endDate ? `to ${endDate}` : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Generating company productivity metrics...</div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Total Hours Logged</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {report?.totalHours ? Number(report.totalHours).toFixed(2) : '0.00'}h
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Across all active project scopes</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Company Billable Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {report?.billableRate || 0}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Ratio of client-invoiced work</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Active Contributors</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {report?.totalContributors || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Employees with timesheets</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Tracked Projects</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {report?.totalProjectsTracked || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Projects with recorded hours</div>
            </div>
          </div>

          {/* Department Breakdown & Top Contributors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Department Hours Distribution */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d4d4d4',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid #d4d4d4',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Layers size={18} color="#2b2b2b" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Hours by Department / Role</h2>
              </div>

              {(!report?.departmentBreakdowns || report.departmentBreakdowns.length === 0) ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>No department data recorded.</div>
              ) : (
                <div style={{ padding: '1.25rem' }}>
                  {report.departmentBreakdowns.map((dept) => {
                    const deptHours = Number(dept.totalHours) || 0;
                    const totalH = Number(report.totalHours) || 1;
                    const percent = Math.min(100, Math.round((deptHours / totalH) * 100));

                    return (
                      <div key={dept.roleCategoryCode} style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 700, color: '#2b2b2b' }}>{dept.roleCategoryName}</span>
                          <span style={{ color: '#666', fontWeight: 600 }}>
                            {deptHours.toFixed(2)}h ({percent}%) · {dept.employeeCount} staff
                          </span>
                        </div>
                        <div style={{
                          height: '8px',
                          backgroundColor: '#eeeeee',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${percent}%`,
                            backgroundColor: '#2b2b2b',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Contributing Employees */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d4d4d4',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid #d4d4d4',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp size={18} color="#2b2b2b" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Top Employee Contributors</h2>
              </div>

              {(!report?.topContributors || report.topContributors.length === 0) ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>No contributor worklogs recorded.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #d4d4d4', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Contributor</th>
                      <th style={{ padding: '0.75rem 1.25rem' }}>Role</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Billable</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Approved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topContributors.map((c) => (
                      <tr key={c.userId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#2b2b2b' }}>
                          {c.userName}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#666', fontSize: '0.85rem' }}>
                          {c.roleCategory}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 800 }}>
                          {Number(c.totalHours).toFixed(2)}h
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', color: '#555' }}>
                          {Number(c.billableHours).toFixed(2)}h
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 600 }}>
                          {Number(c.approvedHours).toFixed(2)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
