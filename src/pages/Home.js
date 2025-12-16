import { Link } from "react-router-dom";
import "../home.css";
import Logo from "../asset/logo192.png"; // ✅ imported correctly

const Home = () => {
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
  <div className="hero-content">
    <span className="badge">Nestlé IT Operations</span>
    <h1>Nestlé IT Service Management Platform</h1>
    <p>
      A centralized digital system for managing IT support requests,
      enterprise assets, and service operations across Nestlé Ghana.
    </p>

    <div className="hero-buttons">
      <Link to="/login" className="btn primary">Sign In</Link>
    </div>
  </div>

  {/* Logo on the right */}
  <div className="hero-logo-wrapper">
    <img 
      src={Logo} 
      alt="Nestlé Logo" 
      className="hero-logo" 
    />
  </div>
</section>


      {/* OVERVIEW */}
      <section className="overview">
        <div className="overview-card">
          <h3>Centralized Support</h3>
          <p>
            All IT requests, incidents, and service issues managed from a
            single, secure platform.
          </p>
        </div>

        <div className="overview-card">
          <h3>Operational Efficiency</h3>
          <p>
            Automated ticket routing, urgency prioritization, and technician
            workflows.
          </p>
        </div>

        <div className="overview-card">
          <h3>Enterprise Visibility</h3>
          <p>
            Real-time insights into system performance, assets, and service
            delivery.
          </p>
        </div>
      </section>

      {/* USER WORKFLOWS */}
      <section className="workflows">
        <h2>Platform Access</h2>

        <div className="workflow-grid">
          <div className="workflow">
            <h4>Employees</h4>
            <p>
              Log incidents, request IT support, monitor ticket progress, and
              track assigned assets.
            </p>
          </div>

          <div className="workflow">
            <h4>IT Technicians</h4>
            <p>
              View assigned tickets, update status and urgency, resolve issues,
              and manage workloads efficiently.
            </p>
          </div>

          <div className="workflow">
            <h4>System Administrators</h4>
            <p>
              Control users, assets, tickets, reports, and system configurations.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Nestlé Ghana — IT Service Management System
        </p>
      </footer>

    </div>
  );
};

export default Home;
