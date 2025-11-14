import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import MainNavbar from '../components/Navbar';
import { Translate, useTranslatedAttribute } from '../utils';
import PageHeader from '../components/PageHeader';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const ShopProfile = () => {
  const { shopData, currentUser, updateShopData } = useAuth();
  
  // Get translations for attributes
  const getTranslatedAttr = useTranslatedAttribute();
  
  // Owner and business information
  const [ownerNames, setOwnerNames] = useState('');
  const [ownerCnicNo, setOwnerCnicNo] = useState('');
  const [ownerMobileNo, setOwnerMobileNo] = useState('');
  const [ntnNo, setNtnNo] = useState('');
  const [salesTaxNo, setSalesTaxNo] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [easypaisaNo, setEasypaisaNo] = useState('');
  const [jazzcashNo, setJazzcashNo] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load shop profile data
  useEffect(() => {
    if (shopData) {
      setOwnerNames(shopData.ownerNames || '');
      setOwnerCnicNo(shopData.ownerCnicNo || '');
      setOwnerMobileNo(shopData.ownerMobileNo || '');
      setNtnNo(shopData.ntnNo || '');
      setSalesTaxNo(shopData.salesTaxNo || '');
      setBankAccountNo(shopData.bankAccountNo || '');
      setEasypaisaNo(shopData.easypaisaNo || '');
      setJazzcashNo(shopData.jazzcashNo || '');
    }
  }, [shopData]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    try {
      // Create updated shop profile data
      const updatedData = {
        ownerNames: ownerNames.trim(),
        ownerCnicNo: ownerCnicNo.trim(),
        ownerMobileNo: ownerMobileNo.trim(),
        ntnNo: ntnNo.trim(),
        salesTaxNo: salesTaxNo.trim(),
        bankAccountNo: bankAccountNo.trim(),
        easypaisaNo: easypaisaNo.trim(),
        jazzcashNo: jazzcashNo.trim(),
        updatedAt: new Date().toISOString()
      };
      
      // Update shop data in Firestore
      await updateShopData(updatedData);
      
      setSuccess('Shop profile updated successfully');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Failed to update shop profile: ' + error.message);
      console.error('Error updating shop profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <MainNavbar />
      <Container>
        <PageHeader 
          title="Shop Profile" 
          icon="bi-person-badge" 
          subtitle="Manage owner information, business details, and payment accounts."
        />
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <h4 className="mb-3">Owner Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Owner Names</Form.Label>
                    <Form.Control
                      type="text"
                      value={ownerNames}
                      onChange={(e) => setOwnerNames(e.target.value)}
                      placeholder="Enter owner names"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Owner CNIC No</Form.Label>
                    <Form.Control
                      type="text"
                      value={ownerCnicNo}
                      onChange={(e) => setOwnerCnicNo(e.target.value)}
                      placeholder="Enter CNIC number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Owner Mobile No</Form.Label>
                    <Form.Control
                      type="text"
                      value={ownerMobileNo}
                      onChange={(e) => setOwnerMobileNo(e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h4 className="mb-3 mt-4">Business Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>NTN NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={ntnNo}
                      onChange={(e) => setNtnNo(e.target.value)}
                      placeholder="Enter NTN number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sales Tax NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={salesTaxNo}
                      onChange={(e) => setSalesTaxNo(e.target.value)}
                      placeholder="Enter sales tax number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h4 className="mb-3 mt-4">Payment Information</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Account NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      placeholder="Enter bank account number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Easy Paisa NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={easypaisaNo}
                      onChange={(e) => setEasypaisaNo(e.target.value)}
                      placeholder="Enter Easy Paisa number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>JazzCash NO</Form.Label>
                    <Form.Control
                      type="text"
                      value={jazzcashNo}
                      onChange={(e) => setJazzcashNo(e.target.value)}
                      placeholder="Enter JazzCash number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default ShopProfile;

