import { useEffect, useState } from "react";
import api from "../api/api";
import "../employee.css";

const TICKETS_PER_PAGE = 6;

const EmployeePage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal and form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Search/Filter/Sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // ----------------------------
  // Fetch tickets
  // ----------------------------
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/tickets");
      if (res.data.success) {
        setTickets(res.data.tickets);
        setFilteredTickets(res.data.tickets);
      } else {
        setError(res.data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ----------------------------
  // Create ticket
  // ----------------------------
  const createTicket = async () => {
    if (!title.trim() || !description.trim()) return alert("Title and description required");
    try {
      setSubmitting(true);
      const res = await api.post("/tickets", { title, description, urgency });
      if (res.data.success) {
        setTickets(prev => [res.data.ticket, ...prev]);
        setFilteredTickets(prev => [res.data.ticket, ...prev]);
        setTitle(""); setDescription(""); setUrgency("normal"); setShowCreateModal(false);
      } else {
        alert(res.data.message || "Failed to create ticket");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------
  // Search/Filter/Sort
  // ----------------------------
  useEffect(() => {
    let filtered = [...tickets];

    if (search) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());
    }

    filtered.sort((a, b) => {
      if (sortField === "created_at") {
        const dateA = new Date(a.created_at), dateB = new Date(b.created_at);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "urgency") {
        const levels = { low: 1, normal: 2, high: 3, critical: 4 };
        return sortOrder === "asc" ? levels[a.urgency] - levels[b.urgency] : levels[b.urgency] - levels[a.urgency];
      }
      return 0;
    });

    setFilteredTickets(filtered);
    setCurrentPage(1); // reset page on filter/search
  }, [search, statusFilter, sortField, sortOrder, tickets]);

  // ----------------------------
  // Pagination helpers
  // ----------------------------
  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const goPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  return (
    <div className="employee-page">

      {/* HEADER */}
      <header className="employee-header">
        <div>
          <h2>My Support Tickets</h2>
          <p className="subtitle">Submit and track your IT support requests</p>
        </div>
      </header>

      {/* FILTER + SEARCH */}
      <div className="ticket-controls">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="inprogress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="created_at">Sort by Date</option>
          <option value="urgency">Sort by Urgency</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* STATUS MESSAGES */}
      {loading && <p className="info">Loading tickets...</p>}
      {error && <p className="error">{error}</p>}

      {/* EMPTY STATE */}
      {!loading && paginatedTickets.length === 0 && !error && (
        <div className="empty-state">
          <h3>No tickets found</h3>
          <p>Create a ticket to get IT support.</p>
          <button className="btn" onClick={() => setShowCreateModal(true)}>Create Ticket</button>
        </div>
      )}

      {/* TICKET LIST */}
      <section className="ticket-grid">
        {paginatedTickets.map(ticket => (
          <article key={ticket.id} className="ticket-card" onClick={() => { setSelectedTicket(ticket); setShowDetailModal(true); }}>
            <div className="ticket-top">
              <h4>{ticket.title}</h4>
              <span className={`status ${ticket.status}`}>{ticket.status}</span>
              <span className={`urgency ${ticket.urgency || "normal"}`}>{ticket.urgency || "Normal"}</span>
            </div>
            <p className="ticket-desc">{ticket.description?.slice(0, 100) || "No description"}…</p>
            <footer className="ticket-footer">
              <small>Ticket #{ticket.id}</small>
              <small>Created: {new Date(ticket.created_at).toLocaleString()}</small>
            </footer>
          </article>
        ))}
      </section>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={goPrevPage} disabled={currentPage === 1}>Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={goNextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Create Support Ticket</h3>
            <input type="text" placeholder="Ticket title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="Describe your issue" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            <select value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowCreateModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn primary" onClick={createTicket} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET DETAILS MODAL */}
      {showDetailModal && selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{selectedTicket.title}</h3>
            <p><strong>Status:</strong> <span className={`status ${selectedTicket.status}`}>{selectedTicket.status}</span></p>
            <p><strong>Urgency:</strong> <span className={`urgency ${selectedTicket.urgency || "normal"}`}>{selectedTicket.urgency || "Normal"}</span></p>
            <p><strong>Description:</strong></p>
            <p>{selectedTicket.description || "No description"}</p>
            <p><small>Created: {new Date(selectedTicket.created_at).toLocaleString()}</small></p>
            {selectedTicket.history?.length > 0 && (
              <>
                <h4>Ticket Updates</h4>
                <ul className="ticket-history">
                  {selectedTicket.history.map((h, idx) => (
                    <li key={idx}>
                      <strong>{h.updated_at ? new Date(h.updated_at).toLocaleString() : ""}:</strong> {h.update || ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="modal-actions">
              <button className="btn primary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeePage;
