import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('process');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Process Payment State
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashGiven, setCashGiven] = useState('');
  const [changeAmount, setChangeAmount] = useState(null);
  // Bank Transfer fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankTransferInfo, setBankTransferInfo] = useState(null);
  const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);
  // Cheque fields
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeBankName, setChequeBankName] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [chequeInfo, setChequeInfo] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  
  // Get Payment State
  const [searchOrderId, setSearchOrderId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const API_BASE_URL = 'http://localhost:8082';

  // Security: API key for service-to-service authentication.
  // In production this would be injected via environment variable (REACT_APP_INTERNAL_API_KEY).
  const INTERNAL_API_KEY = process.env.REACT_APP_INTERNAL_API_KEY || 'sb_secret_f8ZhPKXhsVr4okTJAhuxhQ_d016z0wL';

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setPaymentResult(null);

    // Validate cash payment
    if (paymentMethod === 'Cash') {
      if (!cashGiven || parseFloat(cashGiven) < parseFloat(amount)) {
        setMessage('Error: Cash given is insufficient for the payment amount');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': INTERNAL_API_KEY,
        },
        body: JSON.stringify({
          orderId: parseInt(orderId),
          amount: parseFloat(amount),
          paymentMethod: paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentResult(data);
        // Store change amount if cash payment
        if (paymentMethod === 'Cash') {
          setChangeAmount((parseFloat(cashGiven) - parseFloat(amount)).toFixed(2));
          setBankTransferInfo(null);
          setChequeInfo(null);
          setBankTransferConfirmed(false);
        } else if (paymentMethod === 'BANK_TRANSFER') {
          setBankTransferInfo({
            bankName: bankName,
            accountNumber: accountNumber,
            referenceNumber: referenceNumber
          });
          setChangeAmount(null);
          setChequeInfo(null);
          setBankTransferConfirmed(false);
        } else if (paymentMethod === 'CHEQUE') {
          setChequeInfo({
            chequeNumber: chequeNumber,
            bankName: chequeBankName,
            chequeDate: chequeDate
          });
          setChangeAmount(null);
          setBankTransferInfo(null);
          setBankTransferConfirmed(false);
        } else {
          setChangeAmount(null);
          setBankTransferInfo(null);
          setChequeInfo(null);
          setBankTransferConfirmed(false);
        }
        setMessage('Payment processed successfully!');
        setOrderId('');
        setAmount('');
        setCashGiven('');
        setBankName('');
        setAccountNumber('');
        setReferenceNumber('');
        setChequeNumber('');
        setChequeBankName('');
        setChequeDate('');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Failed to process payment'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBankTransfer = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentResult.paymentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Internal-API-Key': INTERNAL_API_KEY }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBankTransferConfirmed(true);
        // Update the payment result status with actual backend response
        setPaymentResult(data);
        setMessage('✓ Bank transfer verified and confirmed! Payment status updated to PAID.');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Failed to confirm payment'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setPaymentDetails(null);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${searchOrderId}`, {
        headers: { 'X-Internal-API-Key': INTERNAL_API_KEY }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Payment not found'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPaymentFromGet = async () => {
    setConfirmingPayment(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentDetails.paymentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Internal-API-Key': INTERNAL_API_KEY }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update payment details with actual backend response
        setPaymentDetails(data);
        setMessage('✓ Payment confirmed and status updated to PAID');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Failed to confirm payment'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>💳 Payment Processing System</h1>
        
        <div className="tabs">
          <button 
            className={activeTab === 'process' ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab('process');
              setMessage('');
              setPaymentResult(null);
              setPaymentDetails(null);
              setChangeAmount(null);
              setBankTransferInfo(null);
              setChequeInfo(null);
              setBankTransferConfirmed(false);
            }}
          >
            Process Payment
          </button>
          <button 
            className={activeTab === 'get' ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab('get');
              setMessage('');
              setPaymentResult(null);
              setPaymentDetails(null);
              setChangeAmount(null);
              setBankTransferInfo(null);
              setChequeInfo(null);
              setBankTransferConfirmed(false);
            }}
          >
            Get Payment
          </button>
        </div>

        {activeTab === 'process' && (
          <div className="tab-content">
            <h2>Record New Payment</h2>
            <form onSubmit={handleProcessPayment}>
              <div className="form-group">
                <label>Order ID:</label>
                <input
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  placeholder="Enter order ID"
                />
              </div>

              <div className="form-group">
                <label>Amount (Rs):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setCashGiven('');
                    setBankName('');
                    setAccountNumber('');
                    setReferenceNumber('');
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {paymentMethod === 'Cash' && (
                <>
                  <div className="form-group">
                    <label>Cash Given (Rs):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      required
                      placeholder="Enter cash received from customer"
                    />
                  </div>

                  {cashGiven && amount && parseFloat(cashGiven) >= parseFloat(amount) && (
                    <div className="change-display">
                      <strong>Change to Return:</strong> Rs {(parseFloat(cashGiven) - parseFloat(amount)).toFixed(2)}
                    </div>
                  )}

                  {cashGiven && amount && parseFloat(cashGiven) < parseFloat(amount) && (
                    <div className="change-display error-text">
                      <strong>Insufficient Cash:</strong> Rs {(parseFloat(amount) - parseFloat(cashGiven)).toFixed(2)} short
                    </div>
                  )}
                </>
              )}

              {paymentMethod === 'BANK_TRANSFER' && (
                <>
                  <div className="form-group">
                    <label>Bank Name:</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                      placeholder="Enter customer's bank name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Number:</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder="Enter customer's account number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference/Transaction Number:</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      required
                      placeholder="Enter transaction reference number"
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'CHEQUE' && (
                <>
                  <div className="form-group">
                    <label>Cheque Number:</label>
                    <input
                      type="text"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      required
                      placeholder="Enter cheque number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bank Name:</label>
                    <input
                      type="text"
                      value={chequeBankName}
                      onChange={(e) => setChequeBankName(e.target.value)}
                      required
                      placeholder="Enter bank name on cheque"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cheque Date:</label>
                    <input
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                      required
                      placeholder="Enter cheque date"
                    />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
            </form>

            {message && (
              <div className={message.includes('Error') ? 'message error' : 'message success'}>
                {message}
              </div>
            )}

            {paymentResult && (
              <div className="result-card">
                <h3>✅ Payment {paymentResult.paymentStatus === 'PENDING' ? 'Recorded - Awaiting Verification' : 'Completed'}!</h3>
                <div className="result-details">
                  <p><strong>Payment ID:</strong> {paymentResult.paymentId}</p>
                  <p><strong>Order ID:</strong> {paymentResult.orderId}</p>
                  <p><strong>Amount:</strong> Rs {paymentResult.amount}</p>
                  <p><strong>Payment Method:</strong> {paymentResult.paymentMethod}</p>
                  <p><strong>Status:</strong> 
                    <span className={paymentResult.paymentStatus === 'PAID' ? 'status-success' : 'status-pending'}>
                      {paymentResult.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING VERIFICATION'}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(paymentResult.paymentDate).toLocaleString()}</p>
                  {changeAmount !== null && (
                    <p><strong>Change Returned:</strong> <span style={{color: '#28a745', fontWeight: 'bold'}}>Rs {changeAmount}</span></p>
                  )}
                  {bankTransferInfo && (
                    <>
                      <p><strong>Bank Name:</strong> {bankTransferInfo.bankName}</p>
                      <p><strong>Account Number:</strong> {bankTransferInfo.accountNumber}</p>
                      <p><strong>Reference Number:</strong> {bankTransferInfo.referenceNumber}</p>
                    </>
                  )}
                  {chequeInfo && (
                    <>
                      <p><strong>Cheque Number:</strong> {chequeInfo.chequeNumber}</p>
                      <p><strong>Bank Name:</strong> {chequeInfo.bankName}</p>
                      <p><strong>Cheque Date:</strong> {chequeInfo.chequeDate}</p>
                    </>
                  )}
                </div>
                {bankTransferConfirmed && (
                  <div className="success-banner">
                    ✓ {bankTransferInfo ? 'Bank Transfer' : 'Cheque Payment'} Confirmed! Payment status updated to PAID.
                  </div>
                )}
                {paymentResult.paymentStatus === 'PENDING' && (bankTransferInfo || chequeInfo) && !bankTransferConfirmed && (
                  <div className="confirmation-section">
                    <div className="action-required-banner">
                      ⚠️ Action Required: Verify the {paymentResult.paymentMethod === 'BANK_TRANSFER' ? 'bank transfer' : 'cheque'} and confirm receipt
                    </div>
                    <button 
                      onClick={handleConfirmBankTransfer} 
                      className="btn-confirm"
                      disabled={loading}
                    >
                      {loading ? 'Confirming...' : '✓ Confirm Payment Received & Update to PAID'}
                    </button>
                    <p className="confirmation-text">
                      {paymentResult.paymentMethod === 'BANK_TRANSFER' 
                        ? '📋 Check your bank account for the transfer before confirming'
                        : '📋 Verify the cheque has been received and cleared before confirming'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'get' && (
          <div className="tab-content">
            <h2>Get Payment by Order ID</h2>
            <form onSubmit={handleGetPayment}>
              <div className="form-group">
                <label>Order ID:</label>
                <input
                  type="number"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  required
                  placeholder="Enter order ID"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Searching...' : 'Get Payment'}
              </button>
            </form>

            {message && (
              <div className={message.includes('Error') ? 'message error' : 'message success'}>
                {message}
              </div>
            )}

            {paymentDetails && (
              <div className="result-card">
                <h3>💰 Payment Details</h3>
                
                {paymentDetails.paymentStatus === 'PENDING' && 
                 (paymentDetails.paymentMethod === 'BANK_TRANSFER' || paymentDetails.paymentMethod === 'CHEQUE') && (
                  <div className="action-required-banner">
                    ⚠️ Action Required: Verify this payment to mark as paid
                  </div>
                )}
                
                <div className="result-details">
                  <p><strong>Payment ID:</strong> {paymentDetails.paymentId}</p>
                  <p><strong>Order ID:</strong> {paymentDetails.orderId}</p>
                  <p><strong>Amount:</strong> Rs {paymentDetails.amount}</p>
                  <p><strong>Payment Method:</strong> {paymentDetails.paymentMethod}</p>
                  <p><strong>Status:</strong> 
                    <span className={paymentDetails.paymentStatus === 'PAID' ? 'status-success' : 'status-pending'}>
                      {paymentDetails.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(paymentDetails.paymentDate).toLocaleString()}</p>
                </div>

                {paymentDetails.paymentStatus === 'PENDING' && 
                 (paymentDetails.paymentMethod === 'BANK_TRANSFER' || paymentDetails.paymentMethod === 'CHEQUE') && (
                  <div className="confirmation-section">
                    <p className="confirmation-text">
                      {paymentDetails.paymentMethod === 'BANK_TRANSFER' 
                        ? '📋 Verify that the bank transfer has been received before confirming' 
                        : '📋 Verify that the cheque has been received and cleared before confirming'}
                    </p>
                    <button 
                      onClick={handleConfirmPaymentFromGet} 
                      className="btn-confirm"
                      disabled={confirmingPayment}
                    >
                      {confirmingPayment ? 'Confirming...' : '✓ Confirm Payment Received'}
                    </button>
                  </div>
                )}

                {paymentDetails.paymentStatus === 'PAID' && (
                  <div className="success-banner">
                    ✓ Payment Confirmed and Completed
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
