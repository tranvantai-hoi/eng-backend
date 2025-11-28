const Payment = require('../models/Payment');
const Registration = require('../models/Registration');

const createPayment = async (req, res, next) => {
  try {
    const { RegistrationId, SoTien, PhuongThuc, TrangThai } = req.body;

    if (!RegistrationId || !SoTien) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: RegistrationId, SoTien'
      });
    }

    // Check if registration exists
    const registration = await Registration.findById(RegistrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Demo payment creation (no actual Momo integration)
    const payment = await Payment.create({
      RegistrationId,
      SoTien,
      PhuongThuc,
      TrangThai
    });

    // Generate demo payment URL (in real app, this would be Momo payment URL)
    const demoPaymentUrl = `https://demo-payment.com/pay/${payment.id}`;

    res.status(201).json({
      success: true,
      data: payment,
      paymentUrl: demoPaymentUrl,
      message: 'Payment created successfully (DEMO MODE)'
    });
  } catch (error) {
    next(error);
  }
};

const paymentCallback = async (req, res, next) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, status'
      });
    }

    // Check if payment exists
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status (demo - no actual Momo verification)
    const validStatuses = ['success', 'failed', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: success, failed, or cancelled'
      });
    }

    const updatedPayment = await Payment.updateStatus(paymentId, status.toLowerCase());

    // If payment successful, update registration status
    if (status.toLowerCase() === 'success') {
      // In a real app, you might want to update the registration status here
      // await Registration.updateStatus(payment.RegistrationId, 'confirmed');
    }

    res.status(200).json({
      success: true,
      data: updatedPayment,
      message: 'Payment callback processed (DEMO MODE)',
      transactionId: transactionId || 'DEMO-' + Date.now()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  paymentCallback
};

