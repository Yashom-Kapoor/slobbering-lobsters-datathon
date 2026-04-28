import { useState } from "react";
import { postOrganization } from "../api";

const EMPTY = {
  organization_name: "",
  year: "",
  region: "",
  country: "",
  Donor_country: "",
  sdg_focus: "",
  usd_disbursements_defl: "",
  grant_recipient_project_title: "",
  mission_desc: "",
};

const REQUIRED = [
  "organization_name", "year", "region", "country",
  "Donor_country", "sdg_focus", "usd_disbursements_defl",
  "grant_recipient_project_title",
];

export default function OrgForm({ regions, sdgs, countries, onSuccess, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function validate() {
    const errs = {};
    REQUIRED.forEach((f) => {
      if (!String(form[f]).trim()) errs[f] = "Required";
    });
    const yr = parseInt(form.year, 10);
    if (!errs.year && (isNaN(yr) || yr < 2000 || yr > 2030)) {
      errs.year = "Must be between 2000 and 2030";
    }
    const funds = parseFloat(form.usd_disbursements_defl);
    if (!errs.usd_disbursements_defl && (isNaN(funds) || funds < 0)) {
      errs.usd_disbursements_defl = "Must be a non-negative number";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      await postOrganization({
        ...form,
        year: parseInt(form.year, 10),
        usd_disbursements_defl: parseFloat(form.usd_disbursements_defl),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function field(name, label, type = "text", opts = null) {
    const err = errors[name];
    return (
      <div className="form-field" key={name}>
        <label>{label}{REQUIRED.includes(name) && <span className="req">*</span>}</label>
        {opts ? (
          <select
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className={err ? "error" : ""}
          >
            <option value="">Select…</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className={err ? "error" : ""}
            rows={3}
          />
        ) : (
          <input
            type={type}
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className={err ? "error" : ""}
          />
        )}
        {err && <div className="field-error">{err}</div>}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add Organization</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="org-form">
          {field("organization_name", "Organization Name")}
          {field("year", "Year", "number")}
          {field("region", "Region", "text", regions)}
          {field("country", "Country", "text", countries)}
          {field("Donor_country", "Donor Country")}
          {field("sdg_focus", "SDG Focus", "text", sdgs)}
          {field("usd_disbursements_defl", "USD Disbursements (deflated)", "number")}
          {field("grant_recipient_project_title", "Project Title")}
          {field("mission_desc", "Mission Description", "textarea")}

          {serverError && <div className="server-error">{serverError}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Add Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
