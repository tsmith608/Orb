"use client";
import React, { useState } from 'react';
import { CreditCard, User, Calendar, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const CreditCardForm = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
    console.log('Form data submitted:', formData);
  };

  const inputVariants = {
    focus: { 
      borderColor: '#22d3ee', 
      scale: 1.02,
      boxShadow: '0px 0px 8px rgba(34, 211, 238, 0.5)',
    },
    blur: { 
      borderColor: '#374151',
      scale: 1,
      boxShadow: '0px 0px 0px rgba(34, 211, 238, 0)',
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-8">
      <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Make a Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <motion.input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              variants={inputVariants}
              whileFocus="focus"
              initial="blur"
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <motion.input
              type="text"
              name="cardHolder"
              placeholder="Card Holder Name"
              value={formData.cardHolder}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              variants={inputVariants}
              whileFocus="focus"
              initial="blur"
            />
          </div>
          <div className="flex space-x-4">
            <div className="relative w-1/2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <motion.input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                variants={inputVariants}
                whileFocus="focus"
                initial="blur"
              />
            </div>
            <div className="relative w-1/2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <motion.input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                variants={inputVariants}
                whileFocus="focus"
                initial="blur"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Payment
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;
