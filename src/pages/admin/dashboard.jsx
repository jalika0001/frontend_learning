import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api";
import "../../dashboard.css";

export default function Dashboard() {
  // User & Auth
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Items State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: "", price: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", price: "" });
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error("Auth error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        setError("Failed to fetch user data");
      }
    };
    if (token) fetchUser();
  }, [token]);

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/items", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
      setError(null);
    } catch (err) {
      console.error("Fetch items error:", err);
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  // Input Validation
  const validateForm = (data) => {
    if (!data.name?.trim()) return "Item name is required";
    if (!data.price || isNaN(data.price) || parseFloat(data.price) <= 0) return "Valid price is required";
    return null;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add/Create Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      if (formData.image) data.append("image", formData.image);

      await api.post("/items", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setFormData({ name: "", price: "", image: null });
      setImagePreview(null);
      setError(null);
      fetchItems();
      showNotification("Item added successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Item - Open Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({ name: item.name, price: item.price });
    setEditImagePreview(null);
    setShowModal(true);
  };

  // Edit Item - Update
  const handleEditItem = async (e) => {
    e.preventDefault();
    const validationError = validateForm(editFormData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", editFormData.name);
      data.append("price", editFormData.price);
      if (editImagePreview) {
        const fileInput = document.getElementById("editImageInput");
        if (fileInput?.files[0]) data.append("image", fileInput.files[0]);
      }

      await api.put(`/items/${editingItem.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setShowModal(false);
      setEditingItem(null);
      setError(null);
      fetchItems();
      showNotification("Item updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      fetchItems();
      showNotification("Item deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 404) {
        setError("Item not found or already deleted");
      } else {
        setError(err.response?.data?.message || "Failed to delete item");
      }
    }
  };

  // Notification Helper
  const showNotification = (message) => {
    // Simple notification (can be replaced with a toast library)
    const notif = document.createElement("div");
    notif.className = "notification success";
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        {user && <p className="user-welcome">Welcome, <strong>{user.user?.username}</strong>!</p>}
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Add Item Form */}
      <div className="form-section">
        <h2>Add New Item</h2>
        <form onSubmit={handleAddItem} className="item-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="items-section">
        <h2>Items ({items.length})</h2>
        {loading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">No items yet. Create one above!</div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                {item.image && (
                  <img
                    src={`${API_BASE_URL}/uploads/${item.image}`}
                    alt={item.name}
                    className="item-image"
                  />
                )}
                <div className="item-content">
                  <h3>{item.name}</h3>
                  <p className="price">${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditItem}>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) =>
                    setEditFormData(prev => ({ ...prev, price: e.target.value }))
                  }
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  id="editImageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setEditImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
                {editImagePreview && (
                  <div className="image-preview">
                    <img src={editImagePreview} alt="Preview" />
                  </div>
                )}
                {editingItem?.image && !editImagePreview && (
                  <div className="image-preview">
                    <img src={`${API_BASE_URL}/uploads/${editingItem.image}`} alt={editingItem.name} />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Updating..." : "Update Item"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Item?</h2>
            </div>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => handleDeleteItem(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}