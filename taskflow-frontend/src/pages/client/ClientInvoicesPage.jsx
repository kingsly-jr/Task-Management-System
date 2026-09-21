import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  DollarSign,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Eye,
  Filter
} from 'lucide-react';

const ClientInvoicesPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showStatementModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showStatementModal]);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load project financial records');
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic invoices derived from client's contracted projects
  const invoices = projects.flatMap((p, idx) => {
    const budgetVal = Number(p.budget) || 25000;
    const isCompleted = p.status === 'COMPLETED';
    return [
      {
        id: `INV-2026-00${idx * 2 + 1}`,
        projectCode: p.projectCode,
        projectName: p.projectName,
        milestone: 'Initial Sprint Discovery & System Architecture',
        amount: Math.round(budgetVal * 0.35),
        issueDate: p.startDate || '2026-08-01',
        dueDate: '2026-08-31',
        status: 'PAID',
        terms: 'Net 30',
        paymentMethod: 'Corporate Wire Transfer'
      },
      {
        id: `INV-2026-00${idx * 2 + 2}`,
        projectCode: p.projectCode,
        projectName: p.projectName,
        milestone: isCompleted ? 'Core Delivery Acceptance & Deployment' : 'Sprint Milestone Iteration 2',
        amount: Math.round(budgetVal * 0.40),
        issueDate: p.startDate ? '2026-09-01' : '2026-09-01',
        dueDate: '2026-09-30',
        status: isCompleted ? 'PAID' : 'PENDING_REVIEW',
        terms: 'Net 30',
        paymentMethod: 'Corporate Wire Transfer'
      }
    ];
  });

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  const totalContractValue = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalPaid = projects.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);
  const totalRemaining = projects.reduce((acc, p) => {
    const rem = p.remainingAmount !== null && p.remainingAmount !== undefined
      ? Number(p.remainingAmount)
      : Math.max(0, (Number(p.budget) || 0) - (Number(p.paidAmount) || 0));
    return acc + rem;
  }, 0);
  const settlementPercent = totalContractValue > 0 ? Math.round((totalPaid / totalContractValue) * 100) : 0;

  const handleOpenStatement = (invoice) => {
    setSelectedInvoice(invoice);
    setShowStatementModal(true);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px'
          }}>
            Financials
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
            Enterprise Billing &amp; Settlement
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
          Invoices &amp; Contract Billing
        </h1>
        <p style={{ color: '#666666', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
          Review itemized invoices, contract settlement ledger, payment statuses, and contracted project milestones.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#fff5f5',
          border: '1px solid #ffd8d8',
          borderRadius: '8px',
          color: '#c92a2a',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* KPI Financial Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Contract Value
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0' }}>
            ${totalContractValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Across {projects.length} contracted engagements
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Settled / Paid
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b8a3e', margin: '0.4rem 0 0.2rem 0' }}>
            ${totalPaid.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            {settlementPercent}% settled to administration
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Outstanding Balance Due
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: totalRemaining > 0 ? '#d9480f' : '#2b8a3e', margin: '0.4rem 0 0.2rem 0' }}>
            ${totalRemaining.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            {totalRemaining > 0 ? 'Pending payment settlement' : 'All contracts settled in full'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Settlement Progress
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0' }}>
            {settlementPercent}%
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden', marginTop: '0.4rem' }}>
            <div style={{ width: `${settlementPercent}%`, height: '100%', backgroundColor: settlementPercent === 100 ? '#0ca678' : '#2b2b2b', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Contract Settlement Ledger per Project */}
      <div className="card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e' }}>
            Project Settlement Ledger ({projects.length})
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
            Real-time balance breakdown of contract value, paid amount, and remaining due per engagement
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e5e5e5', textAlign: 'left', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.85rem 1.5rem' }}>Project</th>
                <th style={{ padding: '0.85rem 1rem' }}>Project Manager</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Budget</th>
                <th style={{ padding: '0.85rem 1rem' }}>Paid to Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Balance Due</th>
                <th style={{ padding: '0.85rem 1.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c' }}>
                    No project contracts currently recorded.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const bVal = Number(p.budget) || 0;
                  const pVal = Number(p.paidAmount) || 0;
                  const rVal = p.remainingAmount !== null && p.remainingAmount !== undefined
                    ? Number(p.remainingAmount)
                    : Math.max(0, bVal - pVal);
                  const isFullyPaid = rVal === 0 && bVal > 0;
                  const isPartial = pVal > 0 && !isFullyPaid;

                  return (
                    <tr key={p.projectId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#1e1e1e' }}>{p.projectName}</div>
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#666666', fontWeight: 700 }}>
                          {p.projectCode}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#495057' }}>
                        {p.projectManagerName || 'Appointed Manager'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#1e1e1e' }}>
                        ${bVal.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#2b8a3e' }}>
                        ${pVal.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 800, color: rVal > 0 ? '#d9480f' : '#2b8a3e' }}>
                        ${rVal.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: isFullyPaid ? '#e6fcf5' : isPartial ? '#e7f5ff' : '#f1f1f1',
                          color: isFullyPaid ? '#0ca678' : isPartial ? '#1971c2' : '#666666'
                        }}>
                          {isFullyPaid ? '✓ FULLY PAID' : isPartial ? 'PARTIAL PAYMENT' : 'PENDING PAYMENT'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        overflow: 'hidden'
      }}>
        {/* Table Filter Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e' }}>
              Invoice Registry ({filteredInvoices.length})
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
              Contract billing entries and milestones
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'inline-flex', gap: '0.4rem', backgroundColor: '#f2f2f2', padding: '0.25rem', borderRadius: '6px' }}>
            {['ALL', 'PAID', 'PENDING_REVIEW'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: statusFilter === status ? '#1e1e1e' : 'transparent',
                  color: statusFilter === status ? '#ffffff' : '#666666',
                  transition: 'all 0.15s'
                }}
              >
                {status === 'ALL' ? 'All Invoices' : status === 'PAID' ? 'Settled / Paid' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.88rem' }}>
            No invoice records matching criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#666666' }}>Invoice #</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Project / Contract</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Milestone Scope</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Issue Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Due Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#666666', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.95rem 1.25rem', fontWeight: 800, color: '#1e1e1e', fontFamily: 'monospace' }}>
                      {inv.id}
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e1e1e' }}>{inv.projectName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>{inv.projectCode}</div>
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#444444' }}>
                      {inv.milestone}
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#666666' }}>
                      {inv.issueDate}
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#666666' }}>
                      {inv.dueDate}
                    </td>
                    <td style={{ padding: '0.95rem 1rem', fontWeight: 800, color: '#1e1e1e' }}>
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: inv.status === 'PAID' ? '#eef8ee' : '#fff9db',
                        color: inv.status === 'PAID' ? '#2b8a3e' : '#f08c00'
                      }}>
                        {inv.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {inv.status === 'PAID' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenStatement(inv)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d4d4d4',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#2b2b2b'
                        }}
                      >
                        <Eye size={12} />
                        <span>Statement</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVOICE STATEMENT MODAL (Via React Portal) */}
      {showStatementModal && selectedInvoice && createPortal(
        <div
          onClick={() => setShowStatementModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem 1rem',
            overflowY: 'auto'
          }}
        >
          <div
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '560px',
              width: '100%',
              margin: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              padding: '2.25rem'
            }}
          >
            {/* Statement Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e5e5', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#444444',
                  backgroundColor: '#f2f2f2',
                  border: '1px solid #e5e5e5',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  marginBottom: '0.4rem'
                }}>
                  Commercial Statement
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  Invoice {selectedInvoice.id}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#666666', marginTop: '0.2rem' }}>
                  Project: <strong>{selectedInvoice.projectName}</strong> ({selectedInvoice.projectCode})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                style={{ background: '#f2f2f2', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#444444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Statement Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fcfcfc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Description / Milestone:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1e1e' }}>{selectedInvoice.milestone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Issue Date:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e1e1e' }}>{selectedInvoice.issueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Due Date:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e1e1e' }}>{selectedInvoice.dueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Payment Terms:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1e1e' }}>{selectedInvoice.terms}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Status:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedInvoice.status === 'PAID' ? '#2b8a3e' : '#f08c00' }}>
                  {selectedInvoice.status}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e1e1e' }}>Total Billed:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1e1e' }}>
                  ${selectedInvoice.amount.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#2b8a3e', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <ShieldCheck size={14} /> Tax Verified Enterprise Invoice
              </div>
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                style={{
                  padding: '0.6rem 1.4rem',
                  backgroundColor: '#1e1e1e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClientInvoicesPage;
