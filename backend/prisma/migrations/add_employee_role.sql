-- Insert EMPLOYEE role if it doesn't exist
INSERT INTO "Role" (id, name, description)
VALUES (4, 'EMPLOYEE', 'Employee – payroll only, no system login')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
