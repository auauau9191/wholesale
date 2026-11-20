import { useId, useState } from "react";
import Mark from "@/components/docket/Mark";
import { abnDigits, formatAbn, isValidAbn } from "@/lib/abn";

/** A labelled field on carbon. Errors say what's wrong and how to fix it. */
export function Field({ id, label, help, error, children }) {
  return (
    <div className="dk-field">
      <label className="dk-field__label" htmlFor={id}>{label}</label>
      {children}
      {help ? <span className="dk-field__help" id={`${id}-help`}>{help}</span> : null}
      <span className="dk-field__error" id={`${id}-error`} aria-live="polite">{error}</span>
    </div>
  );
}

/**
 * The ABN field: groups the digits as you type (2 3 3 3), and a person's tick appears
 * when the checksum is right. The server still checks the ABN is active before activation.
 */
export function AbnField({ id: idProp, value, onChange, label = "ABN", help = "We check the number's format here, and against the register before activating." }) {
  const autoId = useId();
  const id = idProp ?? `abn-${autoId}`;
  const [touched, setTouched] = useState(false);
  const digits = abnDigits(value);
  const complete = digits.length === 11;
  const valid = complete && isValidAbn(digits);
  const error = complete && !valid ? "That isn't a valid ABN. Check the 11 digits on your ABN record." : touched && digits.length > 0 && !complete ? "An ABN has 11 digits." : "";
  return (
    <Field id={id} label={label} help={help} error={error}>
      <div className="dk-input">
        <input
          id={id}
          name="abn"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11 digits"
          maxLength={14}
          value={formatAbn(value)}
          onChange={(e) => onChange(abnDigits(e.target.value))}
          onBlur={() => setTouched(true)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={`${id}-help ${id}-error`}
        />
        {valid ? <Mark kind="tick" play /> : null}
      </div>
    </Field>
  );
}
