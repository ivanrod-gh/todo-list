package service

import (
	"field-values/pkg/repository"
	"field-values/pkg/structures"
)

type Values interface {
	CreateUpdateDelete(data structures.FieldValues) (structures.FieldValues, error)
	Find(data structures.Find) (structures.FindedFieldValuesMap, error)
	CascadeDelete(data structures.Delete) error
}

type Service struct {
	Values
}

func NewService(repos *repository.Repository) *Service {
	return &Service{
		Values: NewValuesService(repos.Values),
	}
}
