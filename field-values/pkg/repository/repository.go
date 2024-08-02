package repository

import (
	"database/sql"
	"field-values/pkg/structures"
)

type Values interface {
	CreateUpdateDelete(data structures.FieldValues) (structures.FieldValues, error)
	Find(data structures.Find) (structures.FindedFieldValuesMap, error)
	CascadeDelete(data structures.Delete) error
}

type Repository struct {
	Values
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		Values: NewValuesRepository(db),
	}
}
