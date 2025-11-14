import React, { useState, useMemo, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import MainNavbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { createPurchaseOrder, getPurchaseOrders } from '../utils/purchaseUtils';
import { formatDisplayDate } from '../utils/dateUtils';

const defaultRow = { name: '', category: '', description: '', quantity: '', unit: 'units', costPrice: '', sellingPrice: '', expiryDate: '' };
const createEmptyRow = () => ({ ...defaultRow });

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  return Number(value).toFixed(2);
};

const calculateRowTotal = (row) => {
  const quantity = parseFloat(row.quantity) || 0;
  const costPrice = parseFloat(row.costPrice) || 0;
  return quantity * costPrice;
};

const PurchaseManagement = () => {
  const { currentUser, shopData } = useAuth();
  const [rows, setRows] = useState([createEmptyRow()]);
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const totalCost = useMemo(() => {
    return rows.reduce((sum, row) => sum + calculateRowTotal(row), 0);
  }, [rows]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    setHistoryLoading(true);
    getPurchaseOrders(currentUser.uid)
      .then(setHistory)
      .catch(err => console.error('Failed to load purchase history', err))
      .finally(() => setHistoryLoading(false));
  }, [currentUser]);

  const setRowValue = (index, key, value) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addRow = () => setRows(prev => [...prev, createEmptyRow()]);
  const removeRow = (index) => setRows(prev => prev.filter((_, idx) => idx !== index));

  const validateRows = () => {
    const validRows = rows.filter(row => row.name.trim() && parseFloat(row.quantity) > 0);
    if (!validRows.length) {
      setError('Add at least one valid item with name and quantity');
      return null;
    }
    return validRows.map(row => ({
      name: row.name.trim(),
      category: row.category.trim(),
      description: row.description.trim(),
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      costPrice: parseFloat(row.costPrice || 0),
      sellingPrice: row.sellingPrice ? parseFloat(row.sellingPrice) : null,
      expiryDate: row.expiryDate || null,
    }));
  };

  const resetForm = () => {
    setRows([createEmptyRow()]);
    setSupplier('');
    setInvoiceNumber('');
    setNote('');
    setReference('');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validRows = validateRows();
    if (!validRows) return;
    if (!currentUser?.uid) {
      setError('Please login again');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier,
        invoiceNumber,
        purchaseDate,
        note,
        reference,
        items: validRows,
      };
      const purchaseRecord = await createPurchaseOrder(currentUser.uid, payload);
      setSuccess('Purchase recorded and items added to inventory');
      resetForm();
      getPurchaseOrders(currentUser.uid).then(setHistory);
      printInvoice(purchaseRecord);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to record purchase');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = (purchase) => {
    if (!purchase) return;
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const total = purchase.items.reduce((sum, item) => sum + (item.quantity * (item.costPrice || 0)), 0);
      const purchaseDateDisplay = formatDisplayDate(purchase.purchaseDate || new Date());
      const bodyRows = purchase.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.category || '-'}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${formatDisplayDate(item.expiryDate)}</td>
          <td>${formatCurrency(item.costPrice)}</td>
          <td>${formatCurrency(item.quantity * (item.costPrice || 0))}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <title>Purchase Invoice - ${shopData?.shopName || 'Shop'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
              h2 { margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
              th { background: #f5f5f5; }
              .meta { margin-top: 12px; font-size: 13px; }
              .total { margin-top: 20px; font-size: 16px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h2>${shopData?.shopName || 'Shop'} - Purchase Invoice</h2>
            <div class="meta">
              <div><strong>Invoice #:</strong> ${purchase.invoiceNumber || '-'}</div>
              <div><strong>Supplier:</strong> ${purchase.supplier || '-'}</div>
              <div><strong>Date:</strong> ${purchaseDateDisplay}</div>
              <div><strong>Reference:</strong> ${purchase.reference || '-'}</div>
              <div><strong>Note:</strong> ${purchase.note || '-'}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry</th>
                  <th>Cost Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${bodyRows}
              </tbody>
            </table>
            <div class="total">Total Cost: RS ${formatCurrency(total)}</div>
          </body>
        </html>
      `;

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 1000);
    } catch (err) {
      console.error('Print error', err);
    }
  };

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      );
    }

    if (!history.length) {
      return (
        <div className="empty-state">
          <i className="bi bi-receipt"></i>
          <h5>No purchase history yet</h5>
          <p>All recorded purchases will appear here with quick invoice access.</p>
        </div>
      );
    }

    return (
      <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map(purchase => {
            const total = purchase.items?.reduce((sum, item) => sum + (item.quantity * (item.costPrice || 0)), 0) || 0;
            return (
              <tr key={purchase.id}>
                <td>{purchase.invoiceNumber || '-'}</td>
                <td>{purchase.supplier || '-'}</td>
                <td>{formatDisplayDate(purchase.purchaseDate)}</td>
                <td>
                  <Badge bg="primary">{purchase.items?.length || 0}</Badge>
                </td>
                <td>RS {formatCurrency(total)}</td>
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => printInvoice(purchase)}>
                    Print Invoice
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <MainNavbar />
      <Container className="pos-content mt-3">
        <PageHeader
          title="Purchase Management"
          icon="bi-cart-plus"
          subtitle="Record incoming purchases, auto-create inventory items, and keep invoices handy."
        >
          <div className="hero-metrics__item">
            <span className="hero-metrics__label">Supplier</span>
            <span className="hero-metrics__value">{supplier || '—'}</span>
          </div>
          <div className="hero-metrics__item">
            <span className="hero-metrics__label">Items</span>
            <span className="hero-metrics__value">{rows.length}</span>
          </div>
          <div className="hero-metrics__item">
            <span className="hero-metrics__label">Total Cost</span>
            <span className="hero-metrics__value">RS {formatCurrency(totalCost)}</span>
          </div>
        </PageHeader>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Supplier</Form.Label>
                    <Form.Control value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. ABC Distributors" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Invoice Number</Form.Label>
                    <Form.Control value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-00123" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Reference</Form.Label>
                    <Form.Control value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PO number, delivery note, etc." />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Note</Form.Label>
                    <Form.Control value={note} onChange={(e) => setNote(e.target.value)} placeholder="Payment terms, remarks, etc." />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4">
                <h5 className="mb-3">Items</h5>
                {rows.map((row, idx) => (
                  <Card key={idx} className="mb-3">
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Item Name*</Form.Label>
                            <Form.Control value={row.name} onChange={(e) => setRowValue(idx, 'name', e.target.value)} required />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Control value={row.category} onChange={(e) => setRowValue(idx, 'category', e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control value={row.description} onChange={(e) => setRowValue(idx, 'description', e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-1">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Quantity*</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" value={row.quantity} onChange={(e) => setRowValue(idx, 'quantity', e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            <Form.Select value={row.unit} onChange={(e) => setRowValue(idx, 'unit', e.target.value)}>
                              <option value="units">Units</option>
                              <option value="kg">KG</option>
                              <option value="litre">Litre</option>
                              <option value="pack">Pack</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Cost Price (RS)*</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" value={row.costPrice} onChange={(e) => setRowValue(idx, 'costPrice', e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Selling Price (Optional)</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" value={row.sellingPrice} onChange={(e) => setRowValue(idx, 'sellingPrice', e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Expiry Date (Optional)</Form.Label>
                            <Form.Control type="date" value={row.expiryDate || ''} onChange={(e) => setRowValue(idx, 'expiryDate', e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted">Line Total: RS {formatCurrency(calculateRowTotal(row))}</div>
                        <Button variant="outline-danger" size="sm" onClick={() => removeRow(idx)} disabled={rows.length === 1}>
                          Remove
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                <Button variant="outline-primary" onClick={addRow}>
                  + Add Another Item
                </Button>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-4">
                <div className="fw-bold fs-5">Grand Total: RS {formatCurrency(totalCost)}</div>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Purchase & Print Invoice'}
                  </Button>
                  <Button variant="outline-secondary" onClick={resetForm} disabled={loading}>
                    Reset
                  </Button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>Purchase History</Card.Header>
          <Card.Body className="p-0">
            {renderHistory()}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default PurchaseManagement;


