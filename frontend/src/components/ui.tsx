import type { ButtonHTMLAttributes, ReactNode } from "react";
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}
export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="muted small">{hint}</p>}
    </div>
  );
}
export function Feedback({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`feedback ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function SchemaTable({ schema }: { schema: Record<string, string> }) {
  return Object.keys(schema).length ? (
    <div
      className="table-scroll"
      role="region"
      aria-label="Table schema"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            <th scope="col">Column</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(schema).map(([name, type]) => (
            <tr key={name}>
              <th scope="row">
                <code>{name}</code>
              </th>
              <td>
                <code>{type}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="muted">No schema is available for this table.</p>
  );
}
