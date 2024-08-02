package service

import (
	"field-values/pkg/repository"
	"field-values/pkg/structures"
)

type ValuesService struct {
	repo repository.Values
}

func NewValuesService(repo repository.Values) *ValuesService {
	return &ValuesService{repo: repo}
}

func (s *ValuesService) CreateUpdateDelete(data structures.FieldValues) (structures.FieldValues, error) {
	return s.repo.CreateUpdateDelete(data)
}

func (s *ValuesService) Find(data structures.Find) (structures.FindedFieldValuesMap, error) {
	return s.repo.Find(data)
}

func (s *ValuesService) CascadeDelete(data structures.Delete) error {
	return s.repo.CascadeDelete(data)
}
