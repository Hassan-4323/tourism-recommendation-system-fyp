import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowTrendUp,
  FaBars,
  FaCompass,
  FaBell,
  FaBoxOpen,
  FaCalendarCheck,
  FaChartLine,
  FaChevronRight,
  FaCircle,
  FaEnvelope,
  FaGear,
  FaMoneyBillWave,
  FaPenToSquare,
  FaPlus,
  FaTrash,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";
import {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
  getAdminTours,
  createTour,
  updateTour,
  deleteTour,
  getAllBookings,
  adminUpdateBookingStatus,
} from "./api";
import "./AdminDashboard.css";

const INITIAL_USER_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

const INITIAL_TOUR_FORM = {
  title: "",
  location: "",
  description: "",
  price: "",
  durationDays: "",
  imageUrl: "",
  isFeatured: false,
  status: "active",
};

const TAB_ITEMS = [
  { key: "overview", label: "Dashboard", icon: <FaChartLine /> },
  { key: "packages", label: "Manage Packages", icon: <FaBoxOpen /> },
  { key: "users", label: "Manage Users", icon: <FaUsers /> },
  { key: "bookings", label: "Manage Bookings", icon: <FaCalendarCheck /> },
  { key: "reports", label: "Reports", icon: <FaArrowTrendUp /> },
  { key: "insights", label: "Travel Insights", icon: <FaCompass /> },
];

function formatMoney(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function planLabel(planType) {
  const labels = {
    single: "Single",
    group: "Group",
    family: "Family",
  };
  return labels[planType] || planType || "—";
}

function paymentLabel(paymentMethod) {
  const labels = {
    cash_on_arrival: "Cash on Arrival",
    bank_transfer: "Bank Transfer",
    demo_card: "Demo Card",
  };
  return labels[paymentMethod] || paymentMethod || "—";
}

function StatusBadge({ value, type = "booking" }) {
  const normalized = (value || "").toLowerCase();
  return <span className={`admin-status-badge ${type} ${normalized}`}>{value}</span>;
}

function KPI({ icon, label, value, hint, accent = "orange" }) {
  return (
    <div className={`admin-kpi-card ${accent}`}>
      <div className="admin-kpi-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{hint}</span>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmBox, setConfirmBox] = useState({ open: false, type: "", id: null, title: "", message: "" });

  const [packageSearch, setPackageSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState("add");
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [tourModalMode, setTourModalMode] = useState("add");
  const [editingTourId, setEditingTourId] = useState(null);
  const [tourForm, setTourForm] = useState(INITIAL_TOUR_FORM);

  const currentAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, toursRes, bookingsRes] = await Promise.all([
        getAllUsers(),
        getAdminTours(),
        getAllBookings(),
      ]);

      setUsers(usersRes.users || []);
      setTours(toursRes.tours || []);
      setBookings(bookingsRes || []);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + Number(b.totalPrice || 0), 0),
    [bookings]
  );

  const activeToursCount = useMemo(
    () => tours.filter((tour) => (tour.status || "active") === "active").length,
    [tours]
  );

  const featuredToursCount = useMemo(
    () => tours.filter((tour) => tour.isFeatured).length,
    [tours]
  );

  const pendingBookingsCount = useMemo(
    () => bookings.filter((booking) => booking.status === "pending").length,
    [bookings]
  );

  const confirmedBookingsCount = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").length,
    [bookings]
  );

  const adminUsersCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  const filteredTours = useMemo(() => {
    const query = packageSearch.trim().toLowerCase();
    if (!query) return tours;
    return tours.filter(
      (tour) =>
        tour.title?.toLowerCase().includes(query) ||
        tour.location?.toLowerCase().includes(query) ||
        tour.status?.toLowerCase().includes(query)
    );
  }, [tours, packageSearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const filteredBookings = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus = bookingFilter === "all" || booking.status === bookingFilter;
      const matchesSearch =
        !query ||
        booking.user?.name?.toLowerCase().includes(query) ||
        booking.user?.email?.toLowerCase().includes(query) ||
        booking.tour?.title?.toLowerCase().includes(query) ||
        booking.departureCity?.toLowerCase().includes(query) ||
        paymentLabel(booking.paymentMethod).toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, bookingSearch, bookingFilter]);

  const packagePerformance = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const key = booking.tour?._id || booking.tour?.title || "unknown";
      const previous = map.get(key) || {
        title: booking.tour?.title || "Unknown Package",
        bookings: 0,
        revenue: 0,
        confirmed: 0,
      };
      previous.bookings += 1;
      previous.revenue += Number(booking.totalPrice || 0);
      if (booking.status === "confirmed") previous.confirmed += 1;
      map.set(key, previous);
    });

    return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings).slice(0, 5);
  }, [bookings]);

  const paymentBreakdown = useMemo(() => {
    const counts = { cash_on_arrival: 0, bank_transfer: 0, demo_card: 0 };
    bookings.forEach((booking) => {
      counts[booking.paymentMethod] = (counts[booking.paymentMethod] || 0) + 1;
    });
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;
    return [
      { label: "Cash on Arrival", value: counts.cash_on_arrival, width: `${(counts.cash_on_arrival / total) * 100}%` },
      { label: "Bank Transfer", value: counts.bank_transfer, width: `${(counts.bank_transfer / total) * 100}%` },
      { label: "Demo Card", value: counts.demo_card, width: `${(counts.demo_card / total) * 100}%` },
    ];
  }, [bookings]);

  const travelInsights = useMemo(() => {
    const bookingCountMap = new Map();

    bookings.forEach((booking) => {
      const tourId = booking.tour?._id || booking.tour;
      if (!tourId) return;
      bookingCountMap.set(tourId, (bookingCountMap.get(tourId) || 0) + 1);
    });

    const enrichedTours = tours.map((tour) => {
      const bookingCount = bookingCountMap.get(tour._id) || 0;
      const rating = Number(tour.averageRating || 0);
      const reviewCount = Number(tour.reviewCount || 0);
      const popularity = Math.min(100, bookingCount * 16 + (tour.isFeatured ? 12 : 0) + reviewCount * 3);
      const safety = Math.min(100, 58 + rating * 8 + (reviewCount > 0 ? 6 : 0));
      const recommendationScore = Math.round(popularity * 0.55 + safety * 0.45);
      return { ...tour, bookingCount, rating, reviewCount, popularity, safety, recommendationScore };
    });

    return {
      recommended: [...enrichedTours].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6),
      safePlaces: [...enrichedTours].sort((a, b) => b.safety - a.safety).slice(0, 5),
      trending: [...enrichedTours].sort((a, b) => b.popularity - a.popularity).slice(0, 5),
      hiddenGems: [...enrichedTours]
        .filter((tour) => tour.safety >= 70 && tour.bookingCount <= 1)
        .sort((a, b) => b.safety - a.safety)
        .slice(0, 4),
    };
  }, [tours, bookings]);

  const monthlyStats = useMemo(() => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt || booking.travelDate);
      const month = date.getMonth();
      if (month >= 0) counts[month] += 1;
    });
    const max = Math.max(...counts, 1);
    return labels.map((label, index) => ({
      label,
      count: counts[index],
      height: `${Math.max(16, (counts[index] / max) * 100)}%`,
    }));
  }, [bookings]);

  const statusSummary = useMemo(
    () => [
      { label: "Pending", value: pendingBookingsCount },
      { label: "Confirmed", value: confirmedBookingsCount },
      { label: "Cancelled", value: bookings.filter((booking) => booking.status === "cancelled").length },
    ],
    [bookings, confirmedBookingsCount, pendingBookingsCount]
  );

  const openAddUserModal = () => {
    setUserModalMode("add");
    setEditingUserId(null);
    setUserForm(INITIAL_USER_FORM);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setUserModalMode("edit");
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
    });
    setIsUserModalOpen(true);
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      if (userModalMode === "add") {
        const created = await registerUser({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: userForm.password || "Password123!",
          role: userForm.role,
        });
        setUsers((prev) => [...prev, created.user || created]);
        setSuccessMessage("New user added successfully.");
      } else {
        const updatedRes = await updateUser(editingUserId, {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          ...(userForm.password ? { password: userForm.password } : {}),
        });
        const updatedUser = updatedRes.user || updatedRes;
        setUsers((prev) => prev.map((user) => (user._id === editingUserId ? updatedUser : user)));
        setSuccessMessage("User updated successfully.");
      }
      setIsUserModalOpen(false);
    } catch (err) {
      setError(err.message || "Could not save user");
    } finally {
      setLoading(false);
    }
  };

  const askDeleteUser = (id) => {
    setConfirmBox({
      open: true,
      type: "deleteUser",
      id,
      title: "Delete this user?",
      message: "This account will be removed from the system. This action cannot be undone.",
    });
  };

  const openAddTourModal = () => {
    setTourModalMode("add");
    setEditingTourId(null);
    setTourForm(INITIAL_TOUR_FORM);
    setIsTourModalOpen(true);
  };

  const openEditTourModal = (tour) => {
    setTourModalMode("edit");
    setEditingTourId(tour._id);
    setTourForm({
      title: tour.title || "",
      location: tour.location || "",
      description: tour.description || "",
      price: tour.price || "",
      durationDays: tour.durationDays || "",
      imageUrl: tour.imageUrl || "",
      isFeatured: !!tour.isFeatured,
      status: tour.status || "active",
    });
    setIsTourModalOpen(true);
  };

  const handleTourInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTourForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      title: tourForm.title.trim(),
      location: tourForm.location.trim(),
      description: tourForm.description.trim(),
      price: Number(tourForm.price),
      durationDays: Number(tourForm.durationDays),
      imageUrl: tourForm.imageUrl.trim(),
      isFeatured: !!tourForm.isFeatured,
      status: tourForm.status,
    };

    try {
      setLoading(true);
      if (tourModalMode === "add") {
        const createdRes = await createTour(payload);
        const createdTour = createdRes.tour || createdRes;
        setTours((prev) => [createdTour, ...prev]);
        setSuccessMessage("Package created successfully.");
      } else {
        const updatedRes = await updateTour(editingTourId, payload);
        const updatedTour = updatedRes.tour || updatedRes;
        setTours((prev) => prev.map((tour) => (tour._id === editingTourId ? updatedTour : tour)));
        setSuccessMessage("Package updated successfully.");
      }
      setIsTourModalOpen(false);
    } catch (err) {
      setError(err.message || "Could not save package");
    } finally {
      setLoading(false);
    }
  };

  const askDeleteTour = (id) => {
    setConfirmBox({
      open: true,
      type: "deleteTour",
      id,
      title: "Delete this package?",
      message: "The package will be removed from the website list and admin records.",
    });
  };

  const handleBookingStatusChange = async (bookingId, status) => {
    try {
      const updated = await adminUpdateBookingStatus(bookingId, status);
      setBookings((prev) => prev.map((booking) => (booking._id === bookingId ? updated : booking)));
      setSuccessMessage("Booking status updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update booking status");
    }
  };

  const exportBookingsCSV = () => {
    const rows = [
      ["Booking ID", "Traveler", "Email", "Package", "Payment", "Plan", "Status", "Travel Date", "Total Price"],
      ...filteredBookings.map((booking) => [
        booking._id,
        booking.user?.name || booking.travelerName || "",
        booking.user?.email || booking.travelerEmail || "",
        booking.tour?.title || "",
        paymentLabel(booking.paymentMethod),
        planLabel(booking.planType),
        booking.status,
        formatDate(booking.travelDate),
        booking.totalPrice,
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `touringo-admin-bookings-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage("Bookings report exported successfully.");
  };

  const runConfirmAction = async () => {
    const { type, id } = confirmBox;
    setConfirmBox((prev) => ({ ...prev, open: false }));

    try {
      setLoading(true);
      if (type === "deleteUser") {
        await deleteUser(id);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        setSuccessMessage("User deleted successfully.");
      } else if (type === "deleteTour") {
        await deleteTour(id);
        setTours((prev) => prev.filter((tour) => tour._id !== id));
        setSuccessMessage("Package deleted successfully.");
      } else if (type === "logout") {
        onLogout();
        return;
      }
    } catch (err) {
      setError(err.message || "Action could not be completed");
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="admin-tab-content">
      <section className="admin-hero-card">
        <div>
          <p className="admin-eyebrow">Touringo Admin Control Center</p>
          <h1>Run packages, users, bookings and reports from one professional workspace.</h1>
          <span>
            Manage your tourism platform with clearer navigation, stronger visuals and smoother control over the full admin flow.
          </span>
        </div>
        <div className="admin-hero-actions">
          <button className="admin-primary-btn" onClick={() => setActiveTab("packages")}>
            <FaPlus /> Add New Package
          </button>
          <button className="admin-secondary-btn" onClick={() => setActiveTab("reports")}>
            <FaChartLine /> View Reports
          </button>
        </div>
      </section>

      <section className="admin-kpi-grid">
        <KPI icon={<FaBoxOpen />} label="Active Packages" value={activeToursCount} hint={`${featuredToursCount} featured packages`} accent="orange" />
        <KPI icon={<FaUsers />} label="Registered Users" value={users.length} hint={`${adminUsersCount} admin accounts`} accent="blue" />
        <KPI icon={<FaCalendarCheck />} label="Confirmed Bookings" value={confirmedBookingsCount} hint={`${pendingBookingsCount} pending approvals`} accent="green" />
        <KPI icon={<FaMoneyBillWave />} label="Confirmed Revenue" value={formatMoney(totalRevenue)} hint="Based on confirmed bookings" accent="purple" />
      </section>

      <section className="admin-overview-grid">
        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Quick package snapshot</h3>
              <p>See what is active, inactive and featured right now.</p>
            </div>
            <button className="admin-link-btn" onClick={() => setActiveTab("packages")}>Manage Packages</button>
          </div>
          <div className="admin-quick-list">
            <div><strong>{tours.length}</strong><span>Total packages</span></div>
            <div><strong>{activeToursCount}</strong><span>Currently active</span></div>
            <div><strong>{tours.filter((tour) => (tour.status || "active") === "inactive").length}</strong><span>Inactive</span></div>
            <div><strong>{featuredToursCount}</strong><span>Featured trips</span></div>
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Booking status overview</h3>
              <p>Track all reservation states from one summary block.</p>
            </div>
            <button className="admin-link-btn" onClick={() => setActiveTab("bookings")}>Manage Bookings</button>
          </div>
          <div className="admin-mini-table status-cards">
            {statusSummary.map((item) => (
              <div key={item.label} className="admin-mini-row stat-card">
                <div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderPackages = () => (
    <div className="admin-tab-content">
      <section className="admin-panel-card full">
        <div className="admin-panel-head with-toolbar">
          <div>
            <h3>Manage Tour Packages</h3>
            <p>Add, edit, disable and feature travel packages for the website.</p>
          </div>
          <div className="admin-toolbar">
            <input
              className="admin-search-input"
              type="text"
              value={packageSearch}
              onChange={(e) => setPackageSearch(e.target.value)}
              placeholder="Search package by name or location"
            />
            <button className="admin-primary-btn" onClick={openAddTourModal}>
              <FaPlus /> Add New Package
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Location</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTours.map((tour) => (
                <tr key={tour._id}>
                  <td>
                    <div className="admin-table-title-block">
                      <strong>{tour.title}</strong>
                      <span>{tour._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td>{tour.location}</td>
                  <td><StatusBadge value={tour.status || "active"} type="package" /></td>
                  <td>{tour.durationDays} days</td>
                  <td>{formatMoney(tour.price)}</td>
                  <td>{tour.isFeatured ? "Featured" : "Regular"}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="icon-btn edit" onClick={() => openEditTourModal(tour)}><FaPenToSquare /></button>
                      <button className="icon-btn delete" onClick={() => askDeleteTour(tour._id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredTours.length && (
                <tr>
                  <td colSpan="7" className="admin-empty-row">No packages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-tab-content">
      <section className="admin-user-summary-grid">
        <KPI icon={<FaUsers />} label="Total Users" value={users.length} hint="All accounts in the system" accent="blue" />
        <KPI icon={<FaCircle />} label="Admins" value={adminUsersCount} hint="Can access admin dashboard" accent="purple" />
        <KPI icon={<FaEnvelope />} label="Travelers" value={users.length - adminUsersCount} hint="Standard user accounts" accent="green" />
      </section>

      <section className="admin-panel-card full">
        <div className="admin-panel-head with-toolbar">
          <div>
            <h3>Manage Users</h3>
            <p>Create admin accounts, update user roles and remove users when needed.</p>
          </div>
          <div className="admin-toolbar">
            <input
              className="admin-search-input"
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name, email or role"
            />
            <button className="admin-primary-btn" onClick={openAddUserModal}>
              <FaPlus /> Add User
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="admin-table-title-block">
                      <strong>{user.name}</strong>
                      <span>{user._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td><StatusBadge value={user.role} type="user" /></td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="icon-btn edit" onClick={() => openEditUserModal(user)}><FaPenToSquare /></button>
                      <button className="icon-btn delete" onClick={() => askDeleteUser(user._id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan="5" className="admin-empty-row">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderBookings = () => (
    <div className="admin-tab-content">
      <section className="admin-panel-card full">
        <div className="admin-panel-head with-toolbar">
          <div>
            <h3>Manage Bookings</h3>
            <p>Review booking requests, confirm tours and track payment methods.</p>
          </div>
          <div className="admin-toolbar">
            <input
              className="admin-search-input"
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search traveler, package or payment"
            />
            <select className="admin-select-filter" value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="admin-secondary-btn" onClick={exportBookingsCSV}>Export Data</button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Package</th>
                <th>Traveler</th>
                <th>Travel Date</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="admin-table-title-block">
                      <strong>{booking._id.slice(-6).toUpperCase()}</strong>
                      <span>{planLabel(booking.planType)} · {booking.numGuests} travelers</span>
                    </div>
                  </td>
                  <td>{booking.tour?.title || "Tour removed"}</td>
                  <td>
                    <div className="admin-table-title-block compact">
                      <strong>{booking.user?.name || booking.travelerName || "Traveler"}</strong>
                      <span>{booking.user?.email || booking.travelerEmail || booking.departureCity || "—"}</span>
                    </div>
                  </td>
                  <td>{formatDate(booking.travelDate)}</td>
                  <td>{paymentLabel(booking.paymentMethod)}</td>
                  <td>{formatMoney(booking.totalPrice)}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={booking.status}
                      onChange={(e) => handleBookingStatusChange(booking._id, e.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!filteredBookings.length && (
                <tr>
                  <td colSpan="7" className="admin-empty-row">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderReports = () => (
    <div className="admin-tab-content">
      <section className="admin-report-grid">
        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Most Popular Packages</h3>
              <p>Booking volume by package from real project data.</p>
            </div>
          </div>
          <div className="admin-bar-chart">
            {packagePerformance.map((item) => {
              const maxBookings = Math.max(...packagePerformance.map((entry) => entry.bookings), 1);
              return (
                <div key={item.title} className="admin-bar-row">
                  <span>{item.title}</span>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill blue" style={{ width: `${(item.bookings / maxBookings) * 100}%` }} />
                  </div>
                  <strong>{item.bookings}</strong>
                </div>
              );
            })}
            {!packagePerformance.length && <p className="admin-empty-inline">No report data available yet.</p>}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Payment Method Breakdown</h3>
              <p>See what payment options travelers are selecting most.</p>
            </div>
          </div>
          <div className="admin-bar-chart">
            {paymentBreakdown.map((item, index) => (
              <div key={item.label} className="admin-bar-row">
                <span>{item.label}</span>
                <div className="admin-bar-track">
                  <div className={`admin-bar-fill color-${index + 1}`} style={{ width: item.width }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-panel-card full">
        <div className="admin-panel-head">
          <div>
            <h3>Bookings Activity Through the Year</h3>
            <p>Monthly booking movement based on saved records.</p>
          </div>
        </div>
        <div className="admin-month-chart">
          {monthlyStats.map((month) => (
            <div key={month.label} className="admin-month-col">
              <div className="admin-month-bar-wrap">
                <div className="admin-month-bar" style={{ height: month.height }} />
              </div>
              <strong>{month.count}</strong>
              <span>{month.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderTravelInsights = () => (
    <div className="admin-tab-content">
      <section className="admin-panel-card full">
        <div className="admin-panel-head">
          <div>
            <h3>Travel Insights Center</h3>
            <p>Admin overview of recommendation, safety and popularity signals based on current project data.</p>
          </div>
          <button className="admin-link-btn" onClick={() => setActiveTab("packages")}>Manage Packages</button>
        </div>

        <div className="admin-insights-summary-grid">
          <div className="admin-insight-summary warm">
            <strong>{travelInsights.recommended.length}</strong>
            <span>Top Recommendations</span>
            <small>Best combined matches from popularity and safety.</small>
          </div>
          <div className="admin-insight-summary cool">
            <strong>{travelInsights.safePlaces.length}</strong>
            <span>Safe Destinations</span>
            <small>Packages with stronger trust and safer travel signals.</small>
          </div>
          <div className="admin-insight-summary neutral">
            <strong>{travelInsights.trending.length}</strong>
            <span>Popular Right Now</span>
            <small>Most booked destinations from recent project records.</small>
          </div>
        </div>
      </section>

      <section className="admin-report-grid admin-report-grid-insights">
        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Top Recommended Packages</h3>
              <p>Use this section to review strong packages and improve weaker ones.</p>
            </div>
          </div>
          <div className="admin-insight-list">
            {travelInsights.recommended.map((tour, index) => (
              <div key={tour._id || tour.title} className="admin-insight-item">
                <div className="admin-insight-rank">{String(index + 1).padStart(2, "0")}</div>
                <div className="admin-insight-copy">
                  <strong>{tour.title}</strong>
                  <span>{tour.location || "Pakistan"}</span>
                </div>
                <div className="admin-insight-metrics">
                  <span>Score {tour.recommendationScore}</span>
                  <span>Safety {Math.round(tour.safety)}</span>
                </div>
              </div>
            ))}
            {!travelInsights.recommended.length && <p className="admin-empty-inline">No insight data available yet.</p>}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Safe Destinations</h3>
              <p>High-confidence options supported by review quality and package trust.</p>
            </div>
          </div>
          <div className="admin-insight-list compact">
            {travelInsights.safePlaces.map((tour) => (
              <div key={tour._id || tour.title} className="admin-insight-item compact">
                <div className="admin-insight-copy">
                  <strong>{tour.title}</strong>
                  <span>{tour.location || "Pakistan"}</span>
                </div>
                <div className="admin-insight-pill success">Safety {Math.round(tour.safety)}</div>
              </div>
            ))}
            {!travelInsights.safePlaces.length && <p className="admin-empty-inline">No safety insights available yet.</p>}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Popular Right Now</h3>
              <p>Packages getting the strongest booking attention.</p>
            </div>
          </div>
          <div className="admin-insight-list compact">
            {travelInsights.trending.map((tour) => (
              <div key={tour._id || tour.title} className="admin-insight-item compact">
                <div className="admin-insight-copy">
                  <strong>{tour.title}</strong>
                  <span>{tour.location || "Pakistan"}</span>
                </div>
                <div className="admin-insight-pill info">Popularity {Math.round(tour.popularity)}</div>
              </div>
            ))}
            {!travelInsights.trending.length && <p className="admin-empty-inline">No popularity data available yet.</p>}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Hidden Gems</h3>
              <p>Less booked destinations that still show promising travel quality.</p>
            </div>
          </div>
          <div className="admin-insight-list compact">
            {travelInsights.hiddenGems.map((tour) => (
              <div key={tour._id || tour.title} className="admin-insight-item compact">
                <div className="admin-insight-copy">
                  <strong>{tour.title}</strong>
                  <span>{tour.location || "Pakistan"}</span>
                </div>
                <div className="admin-insight-pill warn">Low demand / Safe</div>
              </div>
            ))}
            {!travelInsights.hiddenGems.length && <p className="admin-empty-inline">Hidden gems will appear when safer low-demand places exist.</p>}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className={`admin-dashboard-shell ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <div className="admin-brand-block sidebar-brand">
            <div className="admin-brand-logo">T</div>
            {sidebarOpen && (
              <div>
                <h2>Touringo Admin</h2>
                <p>Tourism Management System</p>
              </div>
            )}
          </div>
          <button className="admin-toggle-btn" onClick={() => setSidebarOpen((prev) => !prev)}>
            {sidebarOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-profile-avatar">{(currentAdmin?.name || "A").charAt(0).toUpperCase()}</div>
          {sidebarOpen && (
            <div>
              <strong>{currentAdmin?.name || "Admin"}</strong>
              <span>{currentAdmin?.email || "admin@touringo.com"}</span>
            </div>
          )}
        </div>

        <nav className="admin-side-nav">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.key}
              className={activeTab === item.key ? "active" : ""}
              onClick={() => setActiveTab(item.key)}
              title={item.label}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span>{item.label}</span>
                  <FaChevronRight className="admin-nav-arrow" />
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-logout" onClick={() => setConfirmBox({ open: true, type: "logout", id: null, title: "Logout from admin panel?", message: "You will be signed out from the admin session." })}>
            {sidebarOpen ? "Logout" : "↗"}
          </button>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar">
          <div className="admin-topbar-main">
            <button className="admin-mobile-menu" onClick={() => setSidebarOpen((prev) => !prev)}>
              <FaBars />
            </button>
            <div>
              <p className="admin-page-tag">Control Panel</p>
              <h2>{TAB_ITEMS.find((item) => item.key === activeTab)?.label || "Dashboard"}</h2>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-icon-circle" type="button"><FaBell /></button>
            <button className="admin-icon-circle" type="button"><FaGear /></button>
            <button className="admin-logout-btn" onClick={() => setConfirmBox({ open: true, type: "logout", id: null, title: "Logout from admin panel?", message: "You will be signed out from the admin session." })}>Logout</button>
          </div>
        </header>

        <main className="admin-content-area">
          {(loading || error || successMessage) && (
            <div className="admin-feedback-strip">
              {loading && <span className="loading">Refreshing admin data...</span>}
              {!loading && error && <span className="error">{error}</span>}
              {!loading && !error && successMessage && <span className="success">{successMessage}</span>}
            </div>
          )}

          {activeTab === "overview" && renderOverview()}
          {activeTab === "packages" && renderPackages()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "bookings" && renderBookings()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "insights" && renderTravelInsights()}
        </main>
      </div>

      {isUserModalOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setIsUserModalOpen(false)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-head">
              <div>
                <span className="admin-modal-chip">User Management</span>
                <h3>{userModalMode === "add" ? "Add New User" : "Edit User"}</h3>
                <p>Manage user identity and role access.</p>
              </div>
              <button className="admin-drawer-close" onClick={() => setIsUserModalOpen(false)}>×</button>
            </div>
            <form className="admin-drawer-form" onSubmit={handleUserSubmit}>
              <label>
                Full Name
                <input type="text" name="name" value={userForm.name} onChange={handleUserInputChange} required />
              </label>
              <label>
                Email Address
                <input type="email" name="email" value={userForm.email} onChange={handleUserInputChange} required disabled={userModalMode === "edit"} />
              </label>
              <label>
                Password {userModalMode === "edit" ? "(optional)" : ""}
                <input type="password" name="password" value={userForm.password} onChange={handleUserInputChange} placeholder={userModalMode === "add" ? "Password123!" : "Leave blank to keep current password"} />
              </label>
              <label>
                Role
                <select name="role" value={userForm.role} onChange={handleUserInputChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="admin-drawer-actions">
                <button type="button" className="admin-secondary-btn" onClick={() => setIsUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-primary-btn">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTourModalOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setIsTourModalOpen(false)}>
          <div className="admin-drawer wide polished" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-head">
              <div>
                <span className="admin-modal-chip">Package Builder</span>
                <h3>{tourModalMode === "add" ? "Add New Package" : "Edit Package"}</h3>
                <p>Control package visibility, trip information and pricing with a cleaner editor.</p>
              </div>
              <button className="admin-drawer-close" onClick={() => setIsTourModalOpen(false)}>×</button>
            </div>
            <div className="admin-package-builder-grid">
              <form className="admin-drawer-form two-col" onSubmit={handleTourSubmit}>
                <label>
                  Package Title
                  <input type="text" name="title" value={tourForm.title} onChange={handleTourInputChange} required />
                </label>
                <label>
                  Location
                  <input type="text" name="location" value={tourForm.location} onChange={handleTourInputChange} required />
                </label>
                <label>
                  Price (PKR)
                  <input type="number" name="price" value={tourForm.price} onChange={handleTourInputChange} required min="1" />
                </label>
                <label>
                  Duration (days)
                  <input type="number" name="durationDays" value={tourForm.durationDays} onChange={handleTourInputChange} required min="1" />
                </label>
                <label>
                  Status
                  <select name="status" value={tourForm.status} onChange={handleTourInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label>
                  Image URL
                  <input type="text" name="imageUrl" value={tourForm.imageUrl} onChange={handleTourInputChange} placeholder="https://example.com/image.jpg" />
                </label>
                <label className="full-row">
                  Description
                  <textarea name="description" value={tourForm.description} onChange={handleTourInputChange} rows="5" required />
                </label>
                <label className="admin-checkbox-row full-row">
                  <input type="checkbox" name="isFeatured" checked={tourForm.isFeatured} onChange={handleTourInputChange} />
                  Mark this package as featured on the user side.
                </label>
                <div className="admin-drawer-actions full-row">
                  <button type="button" className="admin-secondary-btn" onClick={() => setIsTourModalOpen(false)}>Cancel</button>
                  <button type="submit" className="admin-primary-btn">Save Package</button>
                </div>
              </form>

              <aside className="admin-package-preview-card">
                <span className="admin-modal-chip subtle">Live Preview</span>
                <div className="admin-preview-image" style={{ backgroundImage: `url(${tourForm.imageUrl || "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200"})` }} />
                <div className="admin-preview-body">
                  <div className="admin-preview-head">
                    <div>
                      <h4>{tourForm.title || "Package Title"}</h4>
                      <p>{tourForm.location || "Destination location"}</p>
                    </div>
                    <StatusBadge value={tourForm.status || "active"} type="package" />
                  </div>
                  <div className="admin-preview-metrics">
                    <div><span>Price</span><strong>{formatMoney(tourForm.price || 0)}</strong></div>
                    <div><span>Duration</span><strong>{tourForm.durationDays || 0} days</strong></div>
                  </div>
                  <p className="admin-preview-description">{tourForm.description || "Your package description preview will appear here to help the admin create more polished and realistic listings."}</p>
                  <div className="admin-preview-tags">
                    <span>{tourForm.isFeatured ? "Featured package" : "Regular package"}</span>
                    <span>{tourForm.status === "inactive" ? "Hidden from users" : "Visible to users"}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {confirmBox.open && (
        <div className="site-modal-overlay" onClick={() => setConfirmBox((prev) => ({ ...prev, open: false }))}>
          <div className="site-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="site-modal-icon warning">!</div>
            <h3>{confirmBox.title}</h3>
            <p>{confirmBox.message}</p>
            <div className="site-modal-actions">
              <button className="site-modal-secondary" onClick={() => setConfirmBox((prev) => ({ ...prev, open: false }))}>
                Cancel
              </button>
              <button className="site-modal-primary danger" onClick={runConfirmAction}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
