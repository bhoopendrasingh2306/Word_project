import '../App.css';
import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");


function MyComponent() {
  const [value, setValue] = useState("");
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");
  const [isType, setIsType] = useState(false);

  const navigate = useNavigate();
  const { name } = useParams();

  console.log("location", name);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    if (name) {
      getDoc();
    }
  }, []);

  useEffect(() => {
    if (isType) {
      save();
    }
  }, [isType]);

  function getTopic(event) {
    return `doc_${event._id}`;
  }

  async function getDoc() {
    try {
      const url = `http://localhost:3002/doc/details/${name}`;

      const data = await axios.get(url, {
        headers: { token: localStorage.getItem("token") },
      });
      const doc = data && data.data;
      if (doc) {
        setValue(doc.text);
        setFilename(doc.name);

        socket.on(getTopic(doc), (msg) => {
          setValue(msg.text);
        });
      }
      console.log("doc", doc);
    } catch (err) {
      setMessage(err.response.data.message);
      navigate("/");
    }
  }

  function setText(val) {
    setValue(val);
    setIsType(!isType);
  }

  function login() {
    localStorage.clear();
    navigate("/");
  }

  function save() {
    if (!filename) {
      setMessage("File name Required");
    } else {
      saveDoc();
    }
  }

  async function saveDoc() {
    try {
      const url = "http://localhost:3002/doc/add";

      const data = await axios.post(
        url,
        { name: filename, text: value },
        { headers: { token: localStorage.getItem("token") } }
      );
      const user = data && data.data;
      setMessage("Saved Successfully");
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  function newdoc() {
    setFilename("");
    setValue("");
    setMessage("");
    setIsType(true);
    navigate("/doc");
  }

  
  return (
      <div >
        <p style={{ color: "red" }}>{message}</p>

        <div >
          <input
            type="username"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="enter file name"
            readOnly={name ? true : false}
          ></input>
          <button type="submit" onClick={save}>
            Save
          </button>
          <button type="submit" onClick={login}>
            Log Out
          </button>
          <button type="submit" onClick={newdoc}>
            New
          </button>

          <hr></hr>
          <div>
            <ReactQuill
              theme="snow"
              value={value}
              onChange={setText}
              tabIndex={10}
              style={{height: '30em'}}
            />
          </div>
        </div>
      </div>
  );
}

export default MyComponent;
