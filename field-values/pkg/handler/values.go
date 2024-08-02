package handler

import (
	"encoding/json"
	"field-values/pkg/structures"
)

func (h *Handler) validateTaskData(body []byte) structures.Response {
	var delivery structures.TaskData
	var response structures.Response

	err := json.Unmarshal(body, &delivery)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	err = delivery.Validate()
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	response.Data = structures.Validation{Validated: true}

	return response
}

func (h *Handler) createUpdateDelete(body []byte) structures.Response {
	var delivery structures.FieldValuesDelivery
	var response structures.Response
	var values structures.FieldValues

	err := json.Unmarshal(body, &delivery)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	values, err = h.services.CreateUpdateDelete(delivery.Data.FieldValues)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	response.Data = values

	return response
}

func (h *Handler) find(body []byte) structures.Response {
	var delivery structures.FindDelivery
	var response structures.Response
	var values structures.FindedFieldValuesMap

	err := json.Unmarshal(body, &delivery)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	values, err = h.services.Find(delivery.Data.Find)
	if err != nil {
		return h.newErrorResponse(response, err)
	}
	response.Data = values.Values

	return response
}

func (h *Handler) cascadeDelete(body []byte) structures.Response {
	var delivery structures.DeleteDelivery
	var response structures.Response

	err := json.Unmarshal(body, &delivery)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	err = h.services.CascadeDelete(delivery.Data.Delete)
	if err != nil {
		return h.newErrorResponse(response, err)
	}

	response.Data = structures.Deletion{Deleted: true}

	return response
}

func (h *Handler) newErrorResponse(response structures.Response, err error) structures.Response {
	response.Error = err.Error()
	return response
}
