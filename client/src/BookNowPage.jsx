import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiCreditCard,
  FiFlag,
  FiGlobe,
  FiHome,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import MainNavbar from "./MainNavbar";
import "./BookNowPage.css";
import { createBooking, getTourById } from "./api";

const PLAN_CONFIG = {
  single: {
    label: "Single Package",
    shortLabel: "Single",
    icon: "🥾",
    multiplier: 1,
    note: "Ideal for solo travelers who want a flexible and budget-friendly trip.",
    features: [
      "1 traveler booking",
      "Comfort stay included",
      "Local transport support",
      "Guided destination assistance",
    ],
  },
  group: {
    label: "Group Package",
    shortLabel: "Group",
    icon: "👥",
    multiplier: 1.2,
    note: "A balanced choice for friends, classmates or small team tours.",
    features: [
      "2 to 6 travelers",
      "Shared trip coordination",
      "Adventure-friendly plan",
      "Better group value",
    ],
  },
  family: {
    label: "Family Package",
    shortLabel: "Family",
    icon: "👨‍👩‍👧‍👦",
    multiplier: 1.4,
    note: "A smoother and safer booking option designed for family comfort.",
    features: [
      "Family-focused comfort",
      "Flexible itinerary support",
      "Safer activity preference",
      "Extra travel coordination",
    ],
  },
};

const PAYMENT_CONFIG = {
  cash_on_arrival: {
    label: "Cash on Arrival",
    helper: "Reserve now and complete payment when you arrive for your trip.",
    badge: "Most simple",
  },
  bank_transfer: {
    label: "Bank Transfer",
    helper: "Use bank transfer for a more formal confirmation-style booking flow.",
    badge: "Manual verification",
  },
  demo_card: {
    label: "Demo Card Payment",
    helper: "Simulated card payment for your FYP demonstration and booking preview.",
    badge: "Demo checkout",
  },
};


const BOOKING_DRAFT_KEY = (id) => `pendingBookingDraft:${id || "tour"}`;

const INFO_ICONS = {
  destination: FiMapPin,
  location: FiGlobe,
  plan: FiShield,
  travelers: FiUsers,
  start: FiCalendar,
  end: FiCalendar,
  duration: FiCalendar,
  payment: FiCreditCard,
  total: FiCheckCircle,
  traveler: FiUser,
  phone: FiPhone,
  departure: FiFlag,
  email: FiMail,
  stay: FiHome,
};

function SummaryRow({ icon, label, value, total = false }) {
  const Icon = icon;
  return total ? (
    <div className="bn-summary-total">
      <span><Icon size={16} /> {label}</span>
      <strong>{value}</strong>
    </div>
  ) : (
    <div className="bn-summary-row">
      <span><Icon size={16} /> {label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const formatDisplayDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const addDays = (dateString, daysToAdd) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
};

const getMinimumDepartureDate = () => new Date().toISOString().split("T")[0];

function BookNowPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [tour, setTour] = useState(location.state?.tour || null);
  const [loadingTour, setLoadingTour] = useState(!location.state?.tour);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("group");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_arrival");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [loginNotice, setLoginNotice] = useState("");

  const [details, setDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    departureCity: "",
    departureDate: "",
    returnDate: "",
    occupants: 2,
  });

  const [payment, setPayment] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    agree: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setDetails((prev) => ({
          ...prev,
          fullName: parsed.name || prev.fullName,
          email: parsed.email || prev.email,
        }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(BOOKING_DRAFT_KEY(id));
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);
      if (parsed.selectedPlan) setSelectedPlan(parsed.selectedPlan);
      if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
      if (parsed.details) {
        setDetails((prev) => ({ ...prev, ...parsed.details }));
      }
      if (parsed.payment) {
        setPayment((prev) => ({ ...prev, ...parsed.payment, agree: false }));
      }
      if (parsed.resumeStep) setStep(parsed.resumeStep);
      setLoginNotice("Your previous booking details were restored. Please confirm the booking again.");
      sessionStorage.removeItem(BOOKING_DRAFT_KEY(id));
    } catch {}
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadTour = async () => {
      if (tour || !id) {
        setLoadingTour(false);
        return;
      }

      try {
        setLoadingTour(true);
        setError("");
        const data = await getTourById(id);
        if (active) {
          setTour(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load the selected package.");
        }
      } finally {
        if (active) {
          setLoadingTour(false);
        }
      }
    };

    loadTour();
    return () => {
      active = false;
    };
  }, [id, tour]);

  useEffect(() => {
    if (!tour?.durationDays || details.departureDate || details.returnDate) return;

    const suggestedDeparture = addDays(getMinimumDepartureDate(), 1);
    const suggestedReturn = addDays(suggestedDeparture, Math.max((tour.durationDays || 1) - 1, 0));

    setDetails((prev) => ({
      ...prev,
      departureDate: prev.departureDate || suggestedDeparture,
      returnDate: prev.returnDate || suggestedReturn,
    }));
  }, [tour, details.departureDate, details.returnDate]);

  const planInfo = PLAN_CONFIG[selectedPlan];
  const selectedPayment = PAYMENT_CONFIG[paymentMethod];

  const perPersonPrice = useMemo(() => {
    if (!tour?.price) return 0;
    return Math.round(Number(tour.price) * planInfo.multiplier);
  }, [tour, planInfo.multiplier]);

  const totalEstimate = useMemo(() => {
    const guests = Number(details.occupants || 1);
    return perPersonPrice * guests;
  }, [perPersonPrice, details.occupants]);

  const stayDays = useMemo(() => {
    if (!details.departureDate || !details.returnDate) return tour?.durationDays || 0;
    const start = new Date(details.departureDate);
    const end = new Date(details.returnDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [details.departureDate, details.returnDate, tour]);

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;

    setDetails((prev) => {
      const updated = {
        ...prev,
        [name]: name === "occupants" ? Number(value) : value,
      };

      if (name === "departureDate") {
        const currentReturn = prev.returnDate;
        const minReturn = addDays(value, Math.max((tour?.durationDays || 1) - 1, 0));

        if (!currentReturn || new Date(currentReturn) < new Date(value)) {
          updated.returnDate = minReturn;
        }
      }

      return updated;
    });
  };

  const handlePaymentInput = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === "checkbox" ? checked : value;

    if (name === "cardNumber") {
      nextValue = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }

    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      nextValue = digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }

    if (name === "cvv") {
      nextValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setPayment((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const validateStep2 = () => {
    if (!details.fullName.trim()) return "Please enter your full name.";
    if (!details.email.trim()) return "Please enter your email.";
    if (!details.phone.trim()) return "Please enter your phone number.";
    if (!details.departureCity.trim()) return "Please enter your departure city.";
    if (!details.departureDate) return "Please select your departure date.";
    if (!details.returnDate) return "Please select your return date.";
    if (new Date(details.returnDate) < new Date(details.departureDate)) {
      return "Return date must be the same as or after the departure date.";
    }
    if (Number(details.occupants) < 1) return "At least 1 traveler is required.";
    return "";
  };

  const saveBookingDraft = () => {
    sessionStorage.setItem(
      BOOKING_DRAFT_KEY(id),
      JSON.stringify({
        selectedPlan,
        paymentMethod,
        details,
        payment,
        resumeStep: 3,
      })
    );
  };

  const goNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      const msg = validateStep2();
      if (msg) {
        setError(msg);
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const goBack = () => {
    if (step === 1) {
      navigate("/dashboard#packages");
      return;
    }
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!tour?._id) {
      setError("Selected package is missing. Please go back and choose a package again.");
      return;
    }

    if (!payment.agree) {
      setError("Please accept the booking confirmation before continuing.");
      return;
    }

    if (paymentMethod === "demo_card") {
      if (!payment.cardNumber.trim() || !payment.expiry.trim() || !payment.cvv.trim()) {
        setError("Please complete the demo card fields.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError("");

      const booking = await createBooking({
        tourId: tour._id,
        numGuests: Number(details.occupants || 1),
        travelDate: details.departureDate,
        returnDate: details.returnDate || null,
        planType: selectedPlan,
        travelerName: details.fullName.trim(),
        travelerEmail: details.email.trim(),
        travelerPhone: details.phone.trim(),
        departureCity: details.departureCity.trim(),
        paymentMethod,
      });

      setSuccessBooking(booking);
    } catch (err) {
      const message = err.message || "Booking could not be created.";
      if (message.toLowerCase().includes("token") || message.toLowerCase().includes("not authorized")) {
        saveBookingDraft();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        return;
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitle = step === 1 ? "Choose Your Package Plan" : step === 2 ? "Traveler & Schedule Details" : "Payment & Confirmation";
  const stepText =
    step === 1
      ? "Pick the package style that fits the trip, group size and comfort level you want."
      : step === 2
      ? "Add the traveler details and a realistic trip schedule before checkout."
      : "Choose a payment option and review the complete booking before submitting.";

  const renderPlanStep = () => (
    <div className="bn-grid bn-grid-plans">
      {Object.entries(PLAN_CONFIG).map(([key, item]) => {
        const active = key === selectedPlan;
        const cardPrice = tour?.price ? Math.round(Number(tour.price) * item.multiplier) : 0;

        return (
          <button
            type="button"
            key={key}
            className={`bn-plan-card${active ? " active" : ""}`}
            onClick={() => setSelectedPlan(key)}
          >
            <div className="bn-plan-top">
              <span className="bn-plan-icon">{item.icon}</span>
              <div>
                <h3>{item.label}</h3>
                <p>{item.note}</p>
              </div>
            </div>

            <div className="bn-plan-price">PKR {cardPrice.toLocaleString()}</div>
            <div className="bn-plan-subprice">per traveler</div>

            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <span className="bn-plan-select">{active ? "Selected Plan" : "Choose This Plan"}</span>
          </button>
        );
      })}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="bn-grid bn-grid-details">
      <div className="bn-panel">
        <div className="bn-insight-strip">
          <div className="bn-insight-card">
            <span>Recommended stay</span>
            <strong>{tour?.durationDays || 0} days</strong>
          </div>
          <div className="bn-insight-card">
            <span>Selected plan</span>
            <strong>{planInfo.shortLabel}</strong>
          </div>
          <div className="bn-insight-card">
            <span>Estimated total</span>
            <strong>PKR {totalEstimate.toLocaleString()}</strong>
          </div>
        </div>

        <div className="bn-form-grid">
          <label>
            <span><FiUser size={16} /> Lead Traveler Name</span>
            <input type="text" name="fullName" value={details.fullName} onChange={handleDetailsChange} placeholder="Enter full name" />
          </label>
          <label>
            <span><FiMail size={16} /> Email Address</span>
            <input type="email" name="email" value={details.email} onChange={handleDetailsChange} placeholder="Enter email address" />
          </label>
          <label>
            <span><FiPhone size={16} /> Phone Number</span>
            <input type="text" name="phone" value={details.phone} onChange={handleDetailsChange} placeholder="Enter phone number" />
          </label>
          <label>
            <span><FiFlag size={16} /> Departure City</span>
            <input type="text" name="departureCity" value={details.departureCity} onChange={handleDetailsChange} placeholder="e.g. Islamabad" />
          </label>
          <label>
            <span><FiCalendar size={16} /> Trip Start Date</span>
            <input type="date" min={getMinimumDepartureDate()} name="departureDate" value={details.departureDate} onChange={handleDetailsChange} />
          </label>
          <label>
            <span><FiCalendar size={16} /> Trip End Date</span>
            <input type="date" min={details.departureDate || getMinimumDepartureDate()} name="returnDate" value={details.returnDate} onChange={handleDetailsChange} />
          </label>
          <label>
            <span><FiUsers size={16} /> Number of Travelers</span>
            <input type="number" min="1" max="20" name="occupants" value={details.occupants} onChange={handleDetailsChange} />
          </label>
          <label>
            <span><FiMapPin size={16} /> Destination</span>
            <input type="text" value={tour?.title || ""} readOnly />
          </label>
        </div>
      </div>

      <div className="bn-side-card">
        <h3>Trip Summary</h3>
        <SummaryRow icon={INFO_ICONS.destination} label="Destination" value={tour?.title || "-"} />
        <SummaryRow icon={INFO_ICONS.location} label="Location" value={tour?.location || "Pakistan"} />
        <SummaryRow icon={INFO_ICONS.plan} label="Package Plan" value={planInfo.label} />
        <SummaryRow icon={INFO_ICONS.travelers} label="Travelers" value={details.occupants} />
        <SummaryRow icon={INFO_ICONS.start} label="Trip Start" value={formatDisplayDate(details.departureDate)} />
        <SummaryRow icon={INFO_ICONS.end} label="Trip End" value={formatDisplayDate(details.returnDate)} />
        <SummaryRow icon={INFO_ICONS.duration} label="Total Stay" value={`${stayDays || tour?.durationDays || 0} days`} />
        <SummaryRow icon={INFO_ICONS.traveler} label="Per Traveler" value={`PKR ${perPersonPrice.toLocaleString()}`} />
        <SummaryRow icon={INFO_ICONS.total} label="Estimated Total" value={`PKR ${totalEstimate.toLocaleString()}`} total />
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <form className="bn-grid bn-grid-payment" onSubmit={handleSubmitBooking}>
      <div className="bn-panel">
        <div className="bn-payment-methods">
          {Object.entries(PAYMENT_CONFIG).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`bn-method-card${paymentMethod === key ? " active" : ""}`}
              onClick={() => setPaymentMethod(key)}
            >
              <div className="bn-method-head">
                <h3>{key === "cash_on_arrival" ? <><FiCheckCircle size={18} /> {item.label}</> : key === "bank_transfer" ? <><FiHome size={18} /> {item.label}</> : <><FiCreditCard size={18} /> {item.label}</>}</h3>
                <span>{item.badge}</span>
              </div>
              <p>{item.helper}</p>
            </button>
          ))}
        </div>

        {paymentMethod === "demo_card" && (
          <div className="bn-form-grid bn-card-fields">
            <label>
              <span><FiCreditCard size={16} /> Card Number</span>
              <input type="text" name="cardNumber" value={payment.cardNumber} onChange={handlePaymentInput} placeholder="1111 2222 3333 4444" />
            </label>
            <label>
              <span><FiCalendar size={16} /> Expiry</span>
              <input type="text" name="expiry" value={payment.expiry} onChange={handlePaymentInput} placeholder="MM/YY" />
            </label>
            <label>
              <span><FiShield size={16} /> CVV</span>
              <input type="password" name="cvv" value={payment.cvv} onChange={handlePaymentInput} placeholder="123" />
            </label>
          </div>
        )}

        <div className="bn-payment-note"><FiShield size={16} /> For demo purposes, Bank Transfer saves the booking and marks it for manual verification.</div>

        <label className="bn-agree-row">
          <input type="checkbox" name="agree" checked={payment.agree} onChange={handlePaymentInput} />
          <span>I confirm that my traveler information, schedule and payment selection are correct.</span>
        </label>
      </div>

      <div className="bn-side-card payment-summary">
        <h3>Booking Review</h3>
        <SummaryRow icon={INFO_ICONS.traveler} label="Traveler" value={details.fullName || "-"} />
        <SummaryRow icon={INFO_ICONS.phone} label="Phone" value={details.phone || "-"} />
        <SummaryRow icon={INFO_ICONS.departure} label="Departure City" value={details.departureCity || "-"} />
        <SummaryRow icon={INFO_ICONS.start} label="Trip Start" value={formatDisplayDate(details.departureDate)} />
        <SummaryRow icon={INFO_ICONS.end} label="Trip End" value={formatDisplayDate(details.returnDate)} />
        <SummaryRow icon={INFO_ICONS.duration} label="Stay Duration" value={`${stayDays || tour?.durationDays || 0} days`} />
        <SummaryRow icon={INFO_ICONS.plan} label="Plan" value={planInfo.label} />
        <SummaryRow icon={INFO_ICONS.payment} label="Payment" value={selectedPayment.label} />
        <SummaryRow icon={INFO_ICONS.total} label="Final Total" value={`PKR ${totalEstimate.toLocaleString()}`} total />

        <button className="bn-primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );

  if (loadingTour) {
    return (
      <div className="booknow-page">
        <MainNavbar />
        <div className="bn-shell"><div className="bn-state-card">Loading selected package...</div></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="booknow-page">
        <MainNavbar />
        <div className="bn-shell">
          <div className="bn-state-card">
            <h2>Package not found</h2>
            <p>{error || "Please go back and choose a valid tour package."}</p>
            <button className="bn-primary-btn" onClick={() => navigate("/dashboard#packages")}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (successBooking) {
    return (
      <div className="booknow-page">
        <MainNavbar />
        <div className="bn-shell">
          <div className="bn-success-card">
            <div className="bn-success-icon">✓</div>
            <h2>{successBooking?.paymentMethod === "bank_transfer" ? "Booking Submitted" : "Booking Confirmed"}</h2>
            <p>{successBooking?.paymentMethod === "bank_transfer" ? "Your booking was saved successfully. It is now waiting for manual bank transfer verification in the My Bookings section." : "Your package has been saved successfully. You can now check it in the My Bookings section."}</p>
            <div className="bn-success-summary">
              <div><span><FiMapPin size={16} /> Destination</span><strong>{tour.title}</strong></div>
              <div><span>Trip Start</span><strong>{formatDisplayDate(successBooking.travelDate)}</strong></div>
              <div><span>Trip End</span><strong>{formatDisplayDate(successBooking.returnDate)}</strong></div>
              <div><span>Travelers</span><strong>{successBooking.numGuests}</strong></div>
              <div><span>Package Plan</span><strong>{PLAN_CONFIG[successBooking.planType]?.label || "Group Package"}</strong></div>
              <div><span>Payment</span><strong>{PAYMENT_CONFIG[successBooking.paymentMethod]?.label || "Cash on Arrival"}</strong></div>
              <div><span>Total</span><strong>PKR {Number(successBooking.totalPrice || 0).toLocaleString()}</strong></div>
            </div>
            <div className="bn-action-row">
              <button className="bn-secondary-btn" onClick={() => navigate("/dashboard#bookings")}>View My Bookings</button>
              <button className="bn-primary-btn" onClick={() => navigate("/dashboard#packages")}>Browse More Tours</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booknow-page">
      <MainNavbar activeTab="packages" />

      <div className="bn-shell">
        <div className="bn-page-header">
          <button className="bn-back-link" onClick={() => navigate("/dashboard#packages")}>← Back to Dashboard</button>
          <span className="bn-badge">Secure Booking Flow</span>
          <h1>Complete Your Booking</h1>
          <p>Choose your package plan, enter clear traveler information and confirm the booking with a professional step-by-step checkout flow.</p>
        </div>

        <div className="bn-progress-card">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`bn-progress-step${item <= step ? " active" : ""}`}>
              <div className="bn-progress-dot">{item}</div>
              <span>{item === 1 ? "Plan" : item === 2 ? "Details" : "Payment"}</span>
            </div>
          ))}
        </div>

        <div className="bn-card">
          <div className="bn-section-head">
            <div>
              <h2>{stepTitle}</h2>
              <p>{stepText}</p>
            </div>
            <div className="bn-tour-mini">
              <strong>{tour.title}</strong>
              <span>{tour.location || "Pakistan"}</span>
              <small>{tour.durationDays || 0} days recommended stay</small>
            </div>
          </div>

          {loginNotice && <div className="bn-notice">{loginNotice}</div>}
          {error && <div className="bn-error">{error}</div>}

          {step === 1 && renderPlanStep()}
          {step === 2 && renderDetailsStep()}
          {step === 3 && renderPaymentStep()}

          {step !== 3 && (
            <div className="bn-nav-row">
              <button className="bn-secondary-btn" onClick={goBack}>Back</button>
              <button className="bn-primary-btn" onClick={goNext}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookNowPage;
