import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API from '../api';
import Logo from '../assets/images/logotype.svg'

const Login = () => {
    const navigate = useNavigate();
     const [form, setForm] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      console.log(res)
      alert(res.data.message);

   if (res.status === 200) {
        navigate('/');
      }

    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={Logo} alt="" />
        </div> 
      <div className="login-form">
     <div className='links'>
    <NavLink to="/register"  className={({ isActive }) => isActive ? 'active-link' : ''}>Sign Up
    </NavLink>
    <NavLink to="/login"  className={({ isActive }) => isActive ? 'active-link' : ''}>
    Sign In</NavLink>
     </div>
     
      <form onSubmit={handleSubmit}>
        <input name="phone" placeholder="Phone number" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Sign In</button>
       
      </form>
      </div>
    </div>
  );
  
}

export default Login