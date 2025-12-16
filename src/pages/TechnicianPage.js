import { useEffect, useState } from "react";
import api from "../api/api";
import "../technician.css";

const TechnicianPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState({});
  const [selected, setSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 10;

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdate = async (id, status, urgency) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/tickets/${id}/status`, { status, urgency });
      fetchTickets();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} tickets?`)) return;
    try {
      await Promise.all(selected.map(id => api.delete(`/tickets/${id}`)));
      setSelected([]);
      fetchTickets();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const filteredTickets = tickets
    .filter(t => filter === "all" || t.urgency === filter)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  // Dashboard Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    closed: tickets.filter(t => t.status === "closed").length,
    high_critical: tickets.filter(t => t.urgency === "high" || t.urgency === "critical").length,
  };

  return (
    <div className="technician-page">
      <h2>IT Technician Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stats-card">
          <h3>{stats.total}</h3>
          <p>Total Tickets</p>
        </div>
        <div className="stats-card">
          <h3>{stats.open}</h3>
          <p>Open</p>
        </div>
        <div className="stats-card">
          <h3>{stats.in_progress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stats-card">
          <h3>{stats.closed}</h3>
          <p>Closed</p>
        </div>
        <div className="stats-card">
          <h3>{stats.high_critical}</h3>
          <p>High/Critical</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", flex: 1 }}
        />
        {["all", "critical", "high", "normal", "low"].map(u => (
          <button
            key={u}
            className={filter === u ? "active" : ""}
            onClick={() => setFilter(u)}
          >
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bulk-actions">
          <button onClick={handleBulkDelete}>Delete Selected ({selected.length})</button>
        </div>
      )}

      {/* Tickets Table */}
      {paginatedTickets.length === 0 ? (
        <p>No tickets available</p>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={e =>
                    setSelected(e.target.checked ? paginatedTickets.map(t => t.id) : [])
                  }
                  checked={selected.length === paginatedTickets.length}
                />
              </th>
              {["id", "title", "description", "status", "urgency"].map(col => (
                <th key={col} onClick={() => handleSort(col)}>
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  {sortConfig.key === col && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map(t => (
              <tr key={t.id}>
                <td>
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => handleSelect(t.id)} />
                </td>
                <td>{t.id}</td>
                <td>{t.title}</td>
                <td>{t.description}</td>
                <td>
                  <select
                    value={t.status}
                    onChange={e => handleUpdate(t.id, e.target.value, t.urgency)}
                    disabled={updating[t.id]}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <select
                    value={t.urgency || "normal"}
                    onChange={e => handleUpdate(t.id, t.status, e.target.value)}
                    disabled={updating[t.id]}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={goPrev} disabled={currentPage === 1}>Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={goNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default TechnicianPage;
