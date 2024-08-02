package handler

import (
	"encoding/json"
	"errors"
	"field-values/pkg/service"
	"field-values/pkg/structures"
)

type Handler struct {
	services *service.Service
}

func NewHandler(services *service.Service) *Handler {
	return &Handler{services: services}
}

func (h *Handler) Route(body []byte) []byte {
	var delivery structures.Delivery
	var byteRespond []byte
	var response structures.Response

	err := json.Unmarshal(body, &delivery)
	if err != nil {
		return newErrorResponse(response, err.Error())
	}

	switch delivery.Pattern.Cmd {
	case "validateTaskData":
		byteRespond, _ = json.Marshal(h.validateTaskData(body))
	case "createUpdateDelete":
		byteRespond, _ = json.Marshal(h.createUpdateDelete(body))
	case "find":
		byteRespond, _ = json.Marshal(h.find(body))
	case "cascadeDelete":
		byteRespond, _ = json.Marshal(h.cascadeDelete(body))
	default:
		return newErrorResponse(response, errors.New("Route not found").Error())
	}

	return byteRespond
}

func newErrorResponse(response structures.Response, errString string) []byte {
	var byteRespond []byte
	response.Error = errString
	byteRespond, _ = json.Marshal(response)
	return byteRespond
}
