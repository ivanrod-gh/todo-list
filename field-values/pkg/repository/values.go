package repository

import (
	"database/sql"
	"errors"
	"field-values/pkg/structures"
	"fmt"
	"slices"
	"strings"
)

type ValuesRepository struct {
	db *sql.DB
}

func NewValuesRepository(db *sql.DB) *ValuesRepository {
	return &ValuesRepository{db: db}
}

func (r *ValuesRepository) CreateUpdateDelete(data structures.FieldValues) (structures.FieldValues, error) {
	var values structures.FieldValues

	tx, err := r.db.Begin()
	if err != nil {
		return values, err
	}
	defer tx.Rollback()

	if len(data.RealValuesData) > 0 {
		existedFieldIds, err := r.existedFieldsIdentifiers(tx, "real_values", data.RealValuesData)
		if err != nil {
			return values, err
		}

		values.RealValuesData, err = r.createUpdateDeleteValues(tx, "real_values", existedFieldIds, data.RealValuesData)
		if err != nil {
			return values, err
		}
	}

	if len(data.StringValuesData) > 0 {
		existedFieldIds, err := r.existedFieldsIdentifiers(tx, "string_values", data.StringValuesData)
		if err != nil {
			return values, err
		}

		values.StringValuesData, err = r.createUpdateDeleteValues(tx, "string_values", existedFieldIds, data.StringValuesData)
		if err != nil {
			return values, err
		}
	}

	if len(data.ArrayElemValuesData) > 0 {
		existedFieldIds, err := r.existedFieldsIdentifiers(tx, "array_elem_values", data.ArrayElemValuesData)
		if err != nil {
			return values, err
		}

		values.ArrayElemValuesData, err = r.createUpdateDeleteValues(tx, "array_elem_values", existedFieldIds, data.ArrayElemValuesData)
		if err != nil {
			return values, err
		}
	}

	return values, tx.Commit()
}

func (r *ValuesRepository) Find(data structures.Find) (structures.FindedFieldValuesMap, error) {
	var valuesSlice structures.FindedFieldValuesMap
	valuesSlice.Values = make(map[uint64]structures.FieldValues)

	tx, err := r.db.Begin()
	if err != nil {
		return valuesSlice, err
	}
	defer tx.Rollback()

	if len(data.TaskIds) > 0 {

		realValues, err := r.fieldValuesByTable(tx, data, "real_values")
		if err != nil {
			return valuesSlice, nil
		}
		stringValues, err := r.fieldValuesByTable(tx, data, "string_values")
		if err != nil {
			return valuesSlice, nil
		}
		arrayValues, err := r.fieldValuesByTable(tx, data, "array_elem_values")
		if err != nil {
			return valuesSlice, nil
		}

		for _, taskId := range data.TaskIds {
			var fieldValues structures.FieldValues
			for _, elem := range realValues {
				if taskId == elem.TaskId {
					fieldValues.RealValuesData = append(fieldValues.RealValuesData, elem)
				}
			}
			for _, elem := range stringValues {
				if taskId == elem.TaskId {
					fieldValues.StringValuesData = append(fieldValues.StringValuesData, elem)
				}
			}
			for _, elem := range arrayValues {
				if taskId == elem.TaskId {
					fieldValues.ArrayElemValuesData = append(fieldValues.ArrayElemValuesData, elem)
				}
			}
			valuesSlice.Values[taskId] = fieldValues
		}
	}

	return valuesSlice, tx.Commit()
}

func (r *ValuesRepository) CascadeDelete(data structures.Delete) error {
	if len(data.TaskIds) == 0 && len(data.FieldIds) == 0 {
		return errors.New("no delete ids present")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = r.delete(tx, data)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *ValuesRepository) existedFieldsIdentifiers(
	tx *sql.Tx,
	databaseName string,
	elems []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	},
) ([]uint64, error) {
	var sb strings.Builder
	var inputFieldIds []interface{}
	var existedFieldIds []uint64

	for i, elem := range elems {
		if i < 1 {
			inputFieldIds = append(inputFieldIds, elem.TaskId)
		}
		if i > 0 {
			sb.WriteString(fmt.Sprintf(", $%d", i+2))
		} else {
			sb.WriteString(fmt.Sprintf("$%d", i+2))
		}
		inputFieldIds = append(inputFieldIds, elem.FieldId)
	}

	sqlQuery := fmt.Sprintf(
		"SELECT fieldId FROM %s WHERE taskId = $1 AND fieldId IN (%s)",
		databaseName,
		sb.String(),
	)
	rows, err := tx.Query(sqlQuery, inputFieldIds...)
	if err != nil {
		return existedFieldIds, err
	}
	defer rows.Close()

	for rows.Next() {
		var fieldId uint64
		if err := rows.Scan(&fieldId); err != nil {
			return existedFieldIds, err
		}
		existedFieldIds = append(existedFieldIds, fieldId)
	}
	if err = rows.Err(); err != nil {
		return existedFieldIds, err
	}

	return existedFieldIds, nil
}

func (r *ValuesRepository) createUpdateDeleteValues(
	tx *sql.Tx,
	databaseName string,
	existedFieldIds []uint64,
	elems []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	},
) (
	[]struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	},
	error,
) {
	var valueElems []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	}

	for _, elem := range elems {
		existedFieldIndex := slices.IndexFunc(existedFieldIds, func(n uint64) bool { return n == elem.FieldId })
		if existedFieldIndex >= 0 && elem.Destroy {
			sqlQuery := fmt.Sprintf("DELETE FROM %s WHERE taskId = $1 AND fieldId = $2", databaseName)
			if _, err := tx.Exec(
				sqlQuery,
				elem.TaskId,
				elem.FieldId,
			); err != nil {
				return valueElems, err
			}
		} else if existedFieldIndex >= 0 && !elem.Destroy {
			sqlQuery := fmt.Sprintf("UPDATE %s SET value = $3 WHERE taskId = $1 AND fieldId = $2", databaseName)
			if _, err := tx.Exec(
				sqlQuery,
				elem.TaskId,
				elem.FieldId,
				elem.Value,
			); err != nil {
				return valueElems, err
			}
			valueElems = append(valueElems, elem)
		} else if !elem.Destroy {
			sqlQuery := fmt.Sprintf("INSERT INTO %s (taskId, fieldId, value) VALUES ($1, $2, $3)", databaseName)
			if _, err := tx.Exec(
				sqlQuery,
				elem.TaskId,
				elem.FieldId,
				elem.Value,
			); err != nil {
				return valueElems, err
			}
			valueElems = append(valueElems, elem)
		}
	}

	return valueElems, nil
}

func (r *ValuesRepository) fieldValuesByTable(
	tx *sql.Tx,
	data structures.Find,
	databaseName string,
) (
	[]struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	},
	error,
) {
	var valueElems []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	}

	var sb strings.Builder
	var taskIds []interface{}
	for i, id := range data.TaskIds {
		if i > 0 {
			sb.WriteString(fmt.Sprintf(", $%d", i+1))
		} else {
			sb.WriteString(fmt.Sprintf("$%d", i+1))
		}
		taskIds = append(taskIds, id)
	}

	sqlQuery := fmt.Sprintf(
		"SELECT taskId, fieldId, value FROM %s WHERE taskId IN (%s)",
		databaseName,
		sb.String(),
	)

	rows, err := tx.Query(sqlQuery, taskIds...)
	if err != nil {
		return valueElems, err
	}
	defer rows.Close()

	for rows.Next() {
		var valueElem struct {
			TaskId  uint64      `json:"taskId"`
			FieldId uint64      `json:"fieldId"`
			Value   interface{} `json:"value"`
			Destroy bool        `json:",omitempty"`
		}
		if err := rows.Scan(&valueElem.TaskId, &valueElem.FieldId, &valueElem.Value); err != nil {
			return valueElems, err
		}
		valueElems = append(valueElems, valueElem)
	}
	if err = rows.Err(); err != nil {
		return valueElems, err
	}

	return valueElems, nil
}

func (r *ValuesRepository) delete(
	tx *sql.Tx,
	data structures.Delete,
) error {
	var partSqlQuery string
	var taskAndFieldIds []interface{}
	partSqlQuery, taskAndFieldIds = r.deleteQueryAndIds(data)

	sqlQueryReal := fmt.Sprintf(
		"DELETE FROM real_values %s",
		partSqlQuery,
	)
	if _, err := tx.Exec(
		sqlQueryReal,
		taskAndFieldIds...,
	); err != nil {
		return err
	}

	sqlQueryString := fmt.Sprintf(
		"DELETE FROM string_values %s",
		partSqlQuery,
	)
	if _, err := tx.Exec(
		sqlQueryString,
		taskAndFieldIds...,
	); err != nil {
		return err
	}

	sqlQueryArray := fmt.Sprintf(
		"DELETE FROM array_elem_values %s",
		partSqlQuery,
	)
	if _, err := tx.Exec(
		sqlQueryArray,
		taskAndFieldIds...,
	); err != nil {
		return err
	}

	return nil
}

func (r *ValuesRepository) deleteQueryAndIds(data structures.Delete) (string, []interface{}) {
	var partSqlQuery string
	var taskAndFieldIds []interface{}
	var sb strings.Builder

	tasksString := ""
	if len(data.TaskIds) > 0 {
		for i, id := range data.TaskIds {
			if i > 0 {
				sb.WriteString(fmt.Sprintf(", $%d", i+1))
			} else {
				sb.WriteString(fmt.Sprintf("$%d", i+1))
			}
			taskAndFieldIds = append(taskAndFieldIds, id)
		}
		tasksString = fmt.Sprintf(
			"taskId IN (%s)",
			sb.String(),
		)
	}

	sb.Reset()
	fieldsString := ""
	if len(data.FieldIds) > 0 {
		for i, id := range data.FieldIds {
			if i > 0 {
				sb.WriteString(fmt.Sprintf(", $%d", i+1+len(data.TaskIds)))
			} else {
				sb.WriteString(fmt.Sprintf("$%d", i+1+len(data.TaskIds)))
			}
			taskAndFieldIds = append(taskAndFieldIds, id)
		}
		fieldsString = fmt.Sprintf(
			"fieldId IN (%s)",
			sb.String(),
		)
	}

	orString := ""
	if len(data.TaskIds) > 0 && len(data.FieldIds) > 0 {
		orString = " OR "
	}

	partSqlQuery = fmt.Sprintf(
		"WHERE %s%s%s",
		tasksString,
		orString,
		fieldsString,
	)

	return partSqlQuery, taskAndFieldIds
}
