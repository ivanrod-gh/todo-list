CREATE TABLE real_values (
  taskId BIGINT NOT NULL,
  fieldId BIGINT NOT NULL,
  value FLOAT4 NOT NULL
);

CREATE INDEX idx_real_values_taskId
ON real_values (taskId);

CREATE INDEX idx_real_values_fieldId
ON real_values (fieldId);

CREATE TABLE string_values (
  taskId BIGINT NOT NULL,
  fieldId BIGINT NOT NULL,
  value VARCHAR(100) NOT NULL
);

CREATE INDEX idx_string_values_taskId
ON string_values (taskId);

CREATE INDEX idx_string_values_fieldId
ON string_values (fieldId);

CREATE TABLE array_elem_values (
  taskId BIGINT NOT NULL,
  fieldId BIGINT NOT NULL,
  value VARCHAR(100) NOT NULL
);

CREATE INDEX idx_array_elem_values_taskId
ON array_elem_values (taskId);

CREATE INDEX idx_array_elem_values_fieldId
ON array_elem_values (fieldId);