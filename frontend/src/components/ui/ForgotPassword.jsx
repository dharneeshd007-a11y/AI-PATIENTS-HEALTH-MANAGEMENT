import React from 'react';

const ForgotPassword = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-primary hover:text-secondary transition-colors duration-200 focus:outline-none focus:underline font-poppins"
    >
      Forgot password?
    </button>
  );
};

export default ForgotPassword;
