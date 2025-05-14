import { useEffect, useState } from "react";

export function useDepartmentEmployees(departmentId) {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    if (!departmentId) return;
    fetch(`/api/employees?department_id=${departmentId}`)
      .then(res => res.json())
      .then(setEmployees);
  }, [departmentId]);
  return employees;
} 