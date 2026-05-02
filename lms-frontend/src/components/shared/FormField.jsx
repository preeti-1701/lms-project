/**
 * FormField — label + input/select/textarea with consistent dark styling.
 *
 * Props:
 *   label, name, type, value, onChange, placeholder,
 *   options (for select: [{ value, label }]),
 *   error, required, disabled, rows (for textarea)
 */
export default function FormField({
  label, name, type = "text", value, onChange,
  placeholder, options, error, required, disabled, rows,
}) {
  const inputStyle = {
    width: "100%", padding: ".75rem .9rem",
    background: "var(--bg-input)", border: `1px solid ${error ? "rgba(239,68,68,.5)" : "var(--border-strong)"}`,
    borderRadius: "9px", color: "var(--text-primary)",
    fontFamily: "'DM Sans', sans-serif", fontSize: ".875rem", fontWeight: 300,
    outline: "none", transition: "border-color .2s, box-shadow .2s",
    resize: rows ? "vertical" : undefined,
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label style={{
          display: "block", fontSize: ".7rem", fontWeight: 500,
          letterSpacing: ".08em", textTransform: "uppercase",
          color: "var(--text-label)", marginBottom: ".4rem",
        }}>
          {label}{required && <span style={{ color: "#f87171", marginLeft: ".2rem" }}>*</span>}
        </label>
      )}

      {options ? (
        <select
          name={name} value={value} onChange={onChange}
          disabled={disabled} required={required}
          style={{ ...inputStyle, cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <option value="">{placeholder || "Select…"}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required} rows={rows}
          style={inputStyle}
        />
      ) : (
        <input
          name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required}
          style={inputStyle}
        />
      )}

      {error && (
        <div style={{ fontSize: ".72rem", color: "#f87171", marginTop: ".35rem" }}>{error}</div>
      )}
    </div>
  );
}