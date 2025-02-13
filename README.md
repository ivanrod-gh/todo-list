# Todo List

Приложение-напоминание со списком дел пользователя, которые ему нужно выполнить. Пользователь может группировать задачи (**task**) в отдельные проекты (**project**) с определенными статусами (**status**), например "сделать", "сделано" и т.п.

У задач есть имя и описание.

Пользователь в рамках проекта может создать дополнительные поля для задач - числовые, строковые или с выбором из списка. Такие поля можно использовать для определенных задач из этого проекта.

Задачи можно перемещать как по статусу "вверх"/"вниз", так и между различными статусами, т.е. "вправо"/"влево".

Пользователь может создавать, изменять и удалять задачи, но только свои.

Аутентификация выполняется посредством JWT токена.

Приложение написано на **TypeScript** (фреймворк **NestJS**) и **Go** (без фреймворка).

Используемая СУБД - PostgreSQL.

Приложение состоит из трех микросервисов - **general**, **auth** и **field-values**, связанных при помощи брокера RabbitMQ.

Микросервисы **general** и **auth** принимают как сообщения от брокера, так и HTTP запросы.
Микросервис **field-values** принимает только сообщения от брокера.

Для запуска приложения в окружениях `development` и `production` используются переменные окружения, объявленные в .env файлах.

Микросервис **general** запускается на `localhost:3000/`, микросервис **auth** - на `localhost:3001/`.

После запуска приложения автоматически создается root-пользователь с данным из .env файла и правами администратора.

## Запуск в окружении Development

Приложение запускается, используя установленные в системе npm, Go, PostgreSQL и RabbitMQ.

Для создания .env файлов, требуемых приложением, есть примеры с описанием переменных окружения:
- `general/.env.development.example`
- `auth/.env.development.example`
- `field-values/.env.development.example`

Можно выполнить серию переименований .env файлов для того, чтобы передать приложению часть начальных настроек:
- `general/.env.development.example` -> `general/.env.development`
- `auth/.env.development.example` -> `auth/.env.development`
- `field-values/.env.development.example` -> `field-values/.env.development`

Дополнительно для PostgreSQL:
- должен быть создан пользователь, логин и пароль которого необходимо указать в `general/.env.development` и `field-values/.env.development` как `POSTGRES_USER` и `POSTGRES_PASSWORD` соответственно.
- должны быть созданы две база данных, название которых необходимо указать в `general/.env.development` и `field-values/.env.development` как `POSTGRES_DB`.

При необходимости можно поменять настройки из .env файлов.

Приложение запускается из корня проекта командой:
```sh
$ npm i
$ npm run packages:install
$ npm run start:dev
```

## Запуск в окружении Production

Приложение запускается в Docker-контейнерах. В системе должен быть установлен Docker.

Для создания .env файлов, требуемых приложением, есть примеры с описанием переменных окружения:
- `general/.env.production.example`
- `auth/.env.production.example`
- `field-values/.env.production.example`

Можно выполнить серию переименований .env файлов для того, чтобы передать приложению начальные настройки:
- `general/.env.production.example` -> `general/.env.production`
- `auth/.env.production.example` -> `auth/.env.production`
- `field-values/.env.production.example` -> `field-values/.env.production`

Настроек из переименованных .env файлов **достаточно** для запуска в production.

Приложение запускается из корня проекта командой:
```sh
$ docker compose up
```

## Документация

REST API документация становится доступна по адресам `localhost:3000/api/docs/` и `localhost:3001/api/docs/` после запуска приложения.