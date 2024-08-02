package structures

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

const (
	minFloat float64 = -9007199254740992
	maxFloat float64 = 9007199254740991
)

type Data struct {
	Pattern RequestPattern
	Data    string
}

type Delivery struct {
	Pattern RequestPattern
}

type RequestPattern struct {
	Cmd string
}

type TaskData struct {
	Data struct {
		RealValuesData []struct {
			FieldId uint64
			Value   interface{}
			Destroy bool
		}
		StringValuesData []struct {
			FieldId uint64
			Value   interface{}
			Destroy bool
		}
		ArrayElemValuesData []struct {
			FieldId uint64
			Value   interface{}
			Destroy bool
		}
	}
}

type FieldValuesDelivery struct {
	Data struct {
		FieldValues
	} `json:"data"`
}

type FieldValues struct {
	RealValuesData []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	} `json:"realValuesData"`
	StringValuesData []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	} `json:"stringValuesData"`
	ArrayElemValuesData []struct {
		TaskId  uint64      `json:"taskId"`
		FieldId uint64      `json:"fieldId"`
		Value   interface{} `json:"value"`
		Destroy bool        `json:",omitempty"`
	} `json:"arrayElemValuesData"`
}

type FindDelivery struct {
	Data struct {
		Find
	} `json:"data"`
}

type Find struct {
	TaskIds []uint64 `json:"taskIds"`
}

type FindedFieldValuesMap struct {
	Values map[uint64]FieldValues
}

type DeleteDelivery struct {
	Data struct {
		Delete
	} `json:"data"`
}

type Delete struct {
	TaskIds  []uint64 `json:"taskIds"`
	FieldIds []uint64 `json:"fieldIds"`
}

type Response struct {
	Error interface{} `json:"error"`
	Data  interface{} `json:"data"`
}

type Validation struct {
	Validated bool `json:"validated"`
}

type Deletion struct {
	Deleted bool `json:"deleted"`
}

func (d *TaskData) Validate() error {
	var err error

	for _, elem := range d.Data.RealValuesData {
		err = validation.ValidateStruct(
			&elem,
			validation.Field(&elem.Value, validation.Required, validation.Min(minFloat), validation.Max(maxFloat)),
			validation.Field(&elem.FieldId, validation.Required, validation.Min(uint64(1))),
		)
		if err != nil {
			return err
		}
	}
	for _, elem := range d.Data.StringValuesData {
		err = validation.ValidateStruct(
			&elem,
			validation.Field(&elem.Value, validation.Required, validation.Length(2, 100)),
			validation.Field(&elem.FieldId, validation.Required, validation.Min(uint64(1))),
		)
		if err != nil {
			return err
		}
	}
	for _, elem := range d.Data.ArrayElemValuesData {
		err = validation.ValidateStruct(
			&elem,
			validation.Field(&elem.Value, validation.Required, validation.Length(2, 100)),
			validation.Field(&elem.FieldId, validation.Required, validation.Min(uint64(1))),
		)
		if err != nil {
			return err
		}
	}

	return nil
}
