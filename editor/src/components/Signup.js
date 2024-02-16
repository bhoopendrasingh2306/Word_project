import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/doc");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitValidation();
  };

  const submitValidation = async () => {
    try {
      if (await signUp()) {
        navigate("/");
      }
    } catch (err) {
      // navigate('/error', {state: {message: err.response.data.message}} )
      setMessage(err.response.data.message);
    }
  };

  async function signUp() {
    const url = "http://localhost:3002/signup"; //path for connection to backend' signup function

    const data = await axios.post(url, { username, password });

    const user = data && data.data;
    return !!(user && user.username);
  }

  function login() {
    navigate("/");
  }

  return (
    <div className="signup">
      <div className="signup1">
      <div className="heading">
        <h1>Signup</h1>
      </div>
      <div>
        <input
          className="login_input"
          type="username"
          onChange={(e) => setusername(e.target.value)}
          placeholder="username"
        ></input>
        <br></br>
        <br></br>
        <input
          className="login_input"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        ></input>
        <br></br>
        <br></br>
        <button className="submit_btn" type="submit" onClick={handleSubmit}>
          SUBMIT
        </button>
        <br></br>
        <br></br>
        <br></br>
        <div>Already have an account?</div>
        <br></br>
        <button className="login_btn" type="submit" onClick={login}>
          LOGIN
        </button>
        <p style={{ color: "red" }}> {message} </p>
      </div>
      </div>
    </div>
  );
};

export default Signup;
