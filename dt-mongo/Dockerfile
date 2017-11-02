FROM mongo:3.4

RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /mongo-logs
RUN chmod -R 0777 /mongo-logs
ADD docker-entrypoint-initdb.d/* /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/*.sh
EXPOSE 27017
