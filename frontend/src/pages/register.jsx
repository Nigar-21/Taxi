import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import API from '../api';
import Logo from '../assets/images/logotype.svg'
function Register() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'passenger',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', form);
      console.log(res)
      alert(res.data.message);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={Logo} alt="" />
        </div> 
      <div className="register-form">
     <div className='links'>
    <NavLink to="/register"  className={({ isActive }) => isActive ? 'active-link' : ''}>Sign Up
    </NavLink>
    <NavLink to="/login"  className={({ isActive }) => isActive ? 'active-link' : ''}>
    Sign In</NavLink>
     </div>
     
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="phone" placeholder="Phone number" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>
        <button type="submit">Sign Up</button>
       
      </form>
      </div>
    </div>
  );
}

export default Register;
