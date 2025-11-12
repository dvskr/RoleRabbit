/**
 * Shared form types
 * @module types/forms
 */

/**
 * Generic form field change handler
 */
export type FormFieldChangeHandler = (value: string) => void;

/**
 * Form field blur handler  
 */
export type FormFieldBlurHandler = () => void;

/**
 * Generic form submit handler
 */
export type FormSubmitHandler = (event: React.FormEvent) => void;

/**
 * Form field error state
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: FormFieldError[];
}

/**
 * Generic form field props
 */
export interface BaseFormFieldProps {
  id: string;
  name: string;
  value: string | null | undefined;
  onChange: FormFieldChangeHandler;
  onBlur?: FormFieldBlurHandler;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

/**
 * Text field props
 */
export interface TextFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'url' | 'tel';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

/**
 * Textarea field props
 */
export interface TextareaFieldProps extends BaseFormFieldProps {
  rows?: number;
  maxLength?: number;
  autoResize?: boolean;
}

/**
 * Select field option
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select field props
 */
export interface SelectFieldProps extends Omit<BaseFormFieldProps, 'value'> {
  value: string;
  options: SelectOption[];
  emptyOption?: string;
}

/**
 * Checkbox field props
 */
export interface CheckboxFieldProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Date field props (MM/YYYY format)
 */
export interface DateFieldProps extends BaseFormFieldProps {
  format?: 'MM/YYYY' | 'YYYY-MM-DD';
  minDate?: string;
  maxDate?: string;
}
