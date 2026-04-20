
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINT } from "../util";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function ShippingMethods() {
  const [methods, setMethods] = useState([]);
  const [name, setName] = useState("");
  const [charge, setCharge] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchMethods = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_ENDPOINT}/api/v1/shipping-methods`, {
      headers: { "x-access-token": token },
    });
    setMethods(res.data.data);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpen = () => {
    setEditId(null);
    setName("");
    setCharge("");
    setDescription("");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setName("");
    setCharge("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (editId) {
      await axios.put(
        `${API_ENDPOINT}/api/v1/shipping-methods/${editId}`,
        { name, charge, description },
        { headers: { "x-access-token": token } }
      );
    } else {
      await axios.post(
        `${API_ENDPOINT}/api/v1/shipping-methods`,
        { name, charge, description },
        { headers: { "x-access-token": token } }
      );
    }
    handleClose();
    fetchMethods();
  };

  const handleEdit = (method) => {
    setEditId(method._id);
    setName(method.name);
    setCharge(method.charge);
    setDescription(method.description || "");
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_ENDPOINT}/api/v1/shipping-methods/${id}`, {
      headers: { "x-access-token": token },
    });
    fetchMethods();
  };

  return (
    <div className="container mt-4">
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Shipping Methods
        <Fab color="primary" aria-label="add" onClick={handleOpen} size="small">
          <AddIcon />
        </Fab>
      </h2>
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editId ? "Update" : "Add"} Shipping Method</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Charge"
              type="number"
              fullWidth
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button type="submit" color="primary">{editId ? "Update" : "Add"}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <table className="table table-striped table-hover mt-4 shadow-sm rounded">
        <thead className="thead-dark">
          <tr>
            <th>Name</th>
            <th>Charge</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m._id}>
              <td>{m.name}</td>
              <td>{m.charge}</td>
              <td>{m.description}</td>
              <td>
                <Button
                  variant="outlined"
                  size="small"
                  color="info"
                  style={{ marginRight: 8 }}
                  onClick={() => handleEdit(m)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
