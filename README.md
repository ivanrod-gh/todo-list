# Node Server 07

Тестовое приложение на фреймворке NestJS с TypeScript.

Используемая СУБД - PostgreSQL.

Приложение состоит из двух микросервисов - **general** и **auth**, связанных при помощи RabbitMQ.

Микросервисы принимают как сообщения от брокера, так и HTTP запросы.

Для запуска приложения в окружениях `development` и `production` используются переменные окружения, объявляемые посредством .env файлов.

Микросервис **general** запускается на `localhost:3000/`, микросервис **auth** - на `localhost:3001/`.

После запуска приложения автоматически создается root-пользователь с данным из .env файла и правами администратора.

## Запуск в окружении Development

Приложение запускается, используя установленные в системе PostgreSQL и RabbitMQ.

Для создания .env файлов, требуемых приложением, есть примеры с описанием переменных окружения:
- `general/.env.development.example`
- `auth/.env.development.example`

Можно выполнить серию переименований .env файлов для того, чтобы передать приложению часть начальных настроек:
- `general/.env.development.example` -> `general/.env.development`
- `auth/.env.development.example` -> `auth/.env.development`

Дополнительно для PostgreSQL:
- должен быть создан пользователь, логин и пароль которого необходимо указать в `general/.env.development` как `POSTGRES_USER` и `POSTGRES_PASSWORD` соответственно.
- должна быть создана база данных, название которой необходимо указать в `general/.env.development` как `POSTGRES_DB`.

При необходимости можно поменять настройки из .env файлов.

Приложение запускается из корня проекта командой:
```sh
$ npm i
$ npm run packages:install
$ npm run start:dev
```

## Запуск в окружении Production

Приложение запускается в Docker-контейнерах.

Для создания .env файлов, требуемых приложением, есть примеры с описанием переменных окружения:
- `general/.env.production.example`
- `auth/.env.production.example`

Можно выполнить серию переименований .env файлов для того, чтобы передать приложению начальные настройки:
- `general/.env.production.example` -> `general/.env.production`
- `auth/.env.production.example` -> `auth/.env.production`

Настроек из переименованных .env файлов **достаточно** для запуска в production.

Приложение запускается из корня проекта командой:
```sh
$ docker compose up
```

## Документация

REST API документация становится доступна по адресам `localhost:3000/api/docs/` и `localhost:3001/api/docs/` после запуска приложения.