FROM postgres:16.2

ENV POSTGRES_PASSWORD="password"
ENV POSTGRES_DB="node-server06-production"
ENV LANG="ru_RU.utf8"

RUN localedef -i ru_RU -c -f UTF-8 -A /usr/share/locale/locale.alias $LANG

EXPOSE 5432