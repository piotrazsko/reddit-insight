'use client';

import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './AuthForm.module.scss';

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export const FormField = memo<FormFieldProps>(({
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
});

FormField.displayName = 'FormField';

interface SubmitButtonProps {
  loading: boolean;
  children: string;
}

export const SubmitButton = memo<SubmitButtonProps>(({ loading, children }) => {
  return (
    <button type="submit" disabled={loading} className={styles.submitButton}>
      {loading && <Loader2 className={styles.spinner} size={18} />}
      {children}
    </button>
  );
});

SubmitButton.displayName = 'SubmitButton';
