"use client";
 
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
 
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextInput,
} from "@/components/forms/form-primitives";
import type { EmployeeRecord, UserRole } from "@/types";
 
type EmployeePayload = Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">;
 
const defaultValues: EmployeePayload = {
  name: "",
  email: "",
  role: "",
  salary: 0,
  joiningDate: "",
  loginRole: "" as any,
  password: "",
};
 
export function EmployeeForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValues?: EmployeeRecord | null;
  onSubmit: (values: EmployeePayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<EmployeePayload>(defaultValues);
  const [showPassword, setShowPassword] = useState(false);
 
  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        email: initialValues.email,
        role: initialValues.role,
        salary: initialValues.salary,
        joiningDate: initialValues.joiningDate,
        loginRole: initialValues.loginRole ?? ("" as any),
        password: "",
      });
      return;
    }
 
    setValues(defaultValues);
  }, [initialValues]);
 
  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        // Clean up empty loginRole before submission
        const submitValues = {
          ...values,
          loginRole: values.loginRole || undefined,
          password: values.password || undefined,
        };
        await onSubmit(submitValues);
      }}
    >
      <FormGrid>
        <FieldGroup>
          <FieldLabel htmlFor="employee-name">Full name</FieldLabel>
          <TextInput
            id="employee-name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ava Thompson"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-email">Email</FieldLabel>
          <TextInput
            id="employee-email"
            type="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="ava@probase.io"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-role">Role</FieldLabel>
          <TextInput
            id="employee-role"
            value={values.role}
            onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))}
            placeholder="Full Stack Developer"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="employee-salary">Monthly salary</FieldLabel>
          <TextInput
            id="employee-salary"
            type="number"
            min="0"
            value={values.salary}
            onChange={(event) =>
              setValues((current) => ({ ...current, salary: Number(event.target.value) }))
            }
            required
          />
        </FieldGroup>
      </FormGrid>
      <FieldGroup>
        <FieldLabel htmlFor="employee-joining-date">Joining date</FieldLabel>
        <TextInput
          id="employee-joining-date"
          type="date"
          value={values.joiningDate}
          onChange={(event) =>
            setValues((current) => ({ ...current, joiningDate: event.target.value }))
          }
          required
        />
      </FieldGroup>
 
      <div className="border-t border-line pt-4 my-2">
        <h4 className="text-sm font-semibold text-black mb-3">System Login Credentials</h4>
        <FormGrid>
          <FieldGroup>
            <FieldLabel htmlFor="employee-login-role">System Role</FieldLabel>
            <SelectInput
              id="employee-login-role"
              value={values.loginRole ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  loginRole: event.target.value as UserRole || undefined,
                }))
              }
            >
              <option value="">No system login access</option>
              <option value="employee">Employee</option>
              <option value="business">Business User</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </SelectInput>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="employee-password">Password</FieldLabel>
            <div className="relative">
              <TextInput
                id="employee-password"
                type={showPassword ? "text" : "password"}
                value={values.password ?? ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, password: event.target.value }))
                }
                placeholder={initialValues ? "Leave blank to keep existing" : "Min 8 characters"}
                required={!initialValues && Boolean(values.loginRole)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-black transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FieldGroup>
        </FormGrid>
      </div>
 
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
