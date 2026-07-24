FROM rabbitmq:3.11-management-alpine

ENV RABBITMQ_USER user
ENV RABBITMQ_PASSWORD deeptasker
ENV RABBITMQ_PID_FILE /var/lib/rabbitmq/mnesia/rabbitmq

COPY 20-custom.conf /etc/rabbitmq/conf.d
COPY init.sh /init.sh
RUN chmod +x /init.sh

EXPOSE 15672
EXPOSE 5672

CMD ["/init.sh"]
