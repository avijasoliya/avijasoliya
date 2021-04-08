const Payment = require('../models/payment');
const Order = require('../models/order');
const express = require('express');
const router = express.Router();


const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: 'rzp_test_b11CUhIKlcrsMd',
    key_secret: 'lhvH9cKkI8Tys9IF4Arr187Y'
})

router.post('/orders', async (req, res) => {
    const options = {
        subtotal: req.body.subtotal,
        currency: 'INR',
        receipt: shortid.generate(), //any unique id
    }
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error);
        res.status(400).send('Unable to create order');
    }
})